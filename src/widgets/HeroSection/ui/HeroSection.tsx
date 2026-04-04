'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassInput } from '@/shared/ui/GlassInput';
import { analyzeSite, startBusiness } from '@/shared/api/api';

const URL_STORAGE_KEY = 'bizguide-known-urls';

const styles = {
  // Секция Hero: отдельный слой фона + слой контента.
  container: "relative w-full min-h-screen px-4",
  content: "relative z-10 w-full min-h-screen flex flex-col items-center justify-start pt-24 md:pt-28",
  title: "text-white text-4xl md:text-5xl lg:text-6xl font-bold text-center max-w-3xl mx-auto px-4",
  subtitle: "text-white/90 text-base md:text-lg text-center mt-4 max-w-xl mx-auto px-4",
  inputWrapper: "flex justify-center mt-10 w-full px-4",
  inputGroup: "relative w-full max-w-[775px]",
  button: "absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50",
  buttonImg: "w-10 h-10",
  startButtonWrap: "relative mt-3 flex flex-col items-center",
  startButton: "relative z-10 rounded-full bg-[#4E95EC] px-8 py-2 text-white/95 text-xl leading-none hover:opacity-90 transition active:scale-95",
  // Большой фоновый слой песочных часов: на всю ширину и почти на высоту экрана.
  auraWrap:
    "pointer-events-none absolute left-1/2 -translate-x-1/2 top-[34%] h-[82vh] w-screen z-0",
  aura: "w-full h-full object-contain object-center opacity-90 mix-blend-screen",
  error: "mt-3 text-red-100 text-sm text-center",
  // Попап для нового URL (вход/регистрация перед первым анализом).
  firstVisitOverlay: "fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px] flex items-center justify-center px-4",
  firstVisitCard:
    "relative w-full max-w-4xl rounded-[32px] border border-white/40 bg-gradient-to-r from-[#8AB7E7] to-[#6AA8F2] p-6 md:p-10 text-white shadow-2xl overflow-hidden",
  firstVisitClose:
    "absolute right-4 top-4 text-white/70 hover:text-white text-4xl leading-none transition cursor-pointer",
  firstVisitTitle: "text-4xl md:text-6xl font-bold",
  firstVisitText: "mt-12 text-4xl md:text-5xl font-bold leading-tight max-w-xl",
  firstVisitActions: "mt-8 flex flex-wrap gap-3",
  firstVisitButton:
    "rounded-full px-8 py-3 text-3xl md:text-4xl bg-white/20 border border-white/30 hover:bg-white/30 transition",
  // Маскот в попапе авторизации.
  mascot: "pointer-events-none absolute right-4 md:right-8 bottom-0 w-[220px] md:w-[320px] opacity-95",
  // Стили попапа для сценария "бизнес только запускается".
  modalOverlay: "fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center px-4",
  modal: "w-full max-w-2xl rounded-3xl border border-white/30 bg-[#89BAF0] p-6 md:p-8 text-white shadow-2xl",
  modalTitle: "text-2xl md:text-3xl font-bold",
  modalSubtitle: "mt-2 text-white/90",
  formRow: "mt-5 flex flex-col md:flex-row gap-3",
  select:
    "h-11 rounded-xl border border-white/40 bg-white/15 px-4 outline-none focus:border-white/70",
  modalActions: "mt-5 flex gap-3",
  modalButtonPrimary:
    "rounded-xl bg-[#4E95EC] px-5 py-2 font-medium hover:opacity-90 disabled:opacity-50",
  modalButtonGhost: "rounded-xl border border-white/40 px-5 py-2 hover:bg-white/10",
  resultBox: "mt-5 rounded-2xl bg-white/10 p-4 border border-white/30",
  resultTitle: "font-semibold text-lg",
  list: "mt-2 space-y-1 text-sm md:text-base",
};

export const HeroSection = () => {
  // Основной URL для сценария "анализ сайта".
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Модалка для сценария "у меня нет сайта".
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Модалка авторизации при первом URL.
  const [isFirstVisitModalOpen, setIsFirstVisitModalOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState('');

  // Состояние "старта бизнеса".
  const [niche, setNiche] = useState('ecommerce');
  const [startLoading, setStartLoading] = useState(false);
  const [startResult, setStartResult] = useState<{
    niche: string;
    checklist: string[];
    commercialOffer: string[];
  } | null>(null);
  const router = useRouter();

  // Нормализуем URL для проверки "видели ранее / новый адрес".
  const normalizeForStorage = (value: string) => value.trim().toLowerCase();

  const getKnownUrls = (): Set<string> => {
    if (typeof window === 'undefined') return new Set<string>();
    const raw = window.localStorage.getItem(URL_STORAGE_KEY);
    if (!raw) return new Set<string>();
    try {
      return new Set<string>(JSON.parse(raw) as string[]);
    } catch {
      return new Set<string>();
    }
  };

  const rememberUrl = (value: string) => {
    if (typeof window === 'undefined') return;
    const known = getKnownUrls();
    known.add(normalizeForStorage(value));
    window.localStorage.setItem(URL_STORAGE_KEY, JSON.stringify(Array.from(known)));
  };

  const runAnalyzeAndRedirect = async (targetUrl: string) => {
    // Запускаем API-анализ и переходим в личный кабинет конкретного сайта.
    const data = await analyzeSite(targetUrl.trim());
    rememberUrl(targetUrl);
    router.push(`/dashboard/${data.siteId}?url=${encodeURIComponent(data.normalizedUrl)}`);
  };

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setError('');
    const normalizedForStorage = normalizeForStorage(url);
    const known = getKnownUrls();

    // Первый ввод URL -> просим авторизоваться.
    if (!known.has(normalizedForStorage)) {
      rememberUrl(url);
      setPendingUrl(url.trim());
      setIsFirstVisitModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      await runAnalyzeAndRedirect(url);
    } catch {
      setError('Не удалось проанализировать сайт. Проверьте ссылку и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartBusiness = async () => {
    // Запрашиваем персональный старт-план по выбранной нише.
    setStartLoading(true);
    try {
      const data = await startBusiness(niche);
      setStartResult(data);
    } finally {
      setStartLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Декоративный фон Hero (ниже основного контента) */}
      <div className={styles.auraWrap} aria-hidden>
        <img src="/aura.svg" alt="" className={styles.aura} />
      </div>

      {/* Контент Hero: заголовок, URL-форма, CTA */}
      <div className={styles.content}>
        <h1 className={styles.title}>Анализ вашего бизнеса в интернете</h1>
        <p className={styles.subtitle}>проверим, как клиенты находят вас сейчас</p>
        <div className={styles.inputWrapper}>
          <div className={styles.inputGroup}>
            <GlassInput
              type="text"
              placeholder="ссылка на сайт"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              disabled={loading}
              className="text-center placeholder:text-center"
            />
            <button
              className={styles.button}
              onClick={handleAnalyze}
              disabled={loading}
            >
              <img src="/arrow.svg" alt="Анализировать" className={styles.buttonImg} />
            </button>
          </div>
        </div>
        <div className={styles.startButtonWrap}>
          <button className={styles.startButton} onClick={() => setIsModalOpen(true)}>
            у меня нет сайта
          </button>
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
      </div>

      {/* Модалка авторизации для первого URL */}
      {isFirstVisitModalOpen ? (
        <div className={styles.firstVisitOverlay}>
          <div className={styles.firstVisitCard}>
            <button
              className={styles.firstVisitClose}
              onClick={() => setIsFirstVisitModalOpen(false)}
              aria-label="Закрыть"
            >
              ×
            </button>
            <h2 className={styles.firstVisitTitle}>Первый раз на сайте?</h2>
            <p className={styles.firstVisitText}>
              Чтобы начать анализ
              <br />
              нужно войти в аккаунт
            </p>

            <div className={styles.firstVisitActions}>
              <button
                className={styles.firstVisitButton}
                onClick={() =>
                  router.push(`/login?mode=register&url=${encodeURIComponent(pendingUrl || url)}`)
                }
              >
                Зарегистрироваться
              </button>
              <button
                className={styles.firstVisitButton}
                onClick={() => router.push(`/login?mode=login&url=${encodeURIComponent(pendingUrl || url)}`)}
              >
                Войти
              </button>
            </div>

            <img src="/elipsboy.svg" alt="" aria-hidden className={styles.mascot} />
          </div>
        </div>
      ) : null}

      {/* Модалка "помощь со стартом бизнеса" */}
      {isModalOpen ? (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Поможем запустить бизнес с нуля</h2>
            <p className={styles.modalSubtitle}>
              Выберите нишу — мы сразу предложим план первых действий.
            </p>

            <div className={styles.formRow}>
              <select
                className={styles.select}
                value={niche}
                onChange={(event) => setNiche(event.target.value)}
              >
                <option value="ecommerce">Интернет-магазин</option>
                <option value="services">Услуги</option>
                <option value="education">Образование</option>
              </select>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.modalButtonPrimary}
                onClick={handleStartBusiness}
                disabled={startLoading}
              >
                {startLoading ? 'Готовим рекомендации...' : 'Показать план'}
              </button>
              <button className={styles.modalButtonGhost} onClick={() => setIsModalOpen(false)}>
                Закрыть
              </button>
            </div>

            {startResult ? (
              <div className={styles.resultBox}>
                <h3 className={styles.resultTitle}>{startResult.niche}</h3>
                <ul className={styles.list}>
                  {startResult.checklist.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
                <ul className={styles.list}>
                  {startResult.commercialOffer.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};