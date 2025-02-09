
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: 'el', // default language
    fallbackLng: 'el',
    supportedLngs: ['el', 'en', 'zh', 'ru', 'es', 'de'],
    
    interpolation: {
      escapeValue: false,
    },
    
    resources: {
      el: {
        translation: {
          'search.placeholder': 'Αναζήτηση αγγελιών...',
          'jobs.title': 'Αγγελίες Εργασίας',
          'post.job': 'Καταχώρηση Αγγελίας',
          'listings': 'Αγγελίες',
          'share': 'Κοινοποίηση',
          'send.cv': 'Αποστολή CV',
          'days.remaining': '{{count}} ημέρες απομένουν',
          'expired': 'Έληξε',
          'loading': 'Φόρτωση αγγελιών...',
          'no.results': 'Δεν βρέθηκαν αγγελίες με τα επιλεγμένα κριτήρια'
        }
      },
      en: {
        translation: {
          'search.placeholder': 'Search jobs...',
          'jobs.title': 'Job Listings',
          'post.job': 'Post a Job',
          'listings': 'Listings',
          'share': 'Share',
          'send.cv': 'Send CV',
          'days.remaining': '{{count}} days remaining',
          'expired': 'Expired',
          'loading': 'Loading jobs...',
          'no.results': 'No jobs found with the selected criteria'
        }
      },
      zh: {
        translation: {
          'search.placeholder': '搜索工作...',
          'jobs.title': '职位列表',
          'post.job': '发布工作',
          'listings': '列表',
          'share': '分享',
          'send.cv': '发送简历',
          'days.remaining': '剩余{{count}}天',
          'expired': '已过期',
          'loading': '加载工作...',
          'no.results': '未找到符合所选条件的工作'
        }
      },
      ru: {
        translation: {
          'search.placeholder': 'Поиск вакансий...',
          'jobs.title': 'Список вакансий',
          'post.job': 'Разместить вакансию',
          'listings': 'Вакансии',
          'share': 'Поделиться',
          'send.cv': 'Отправить резюме',
          'days.remaining': 'Осталось {{count}} дней',
          'expired': 'Истекло',
          'loading': 'Загрузка вакансий...',
          'no.results': 'Не найдено вакансий по выбранным критериям'
        }
      },
      es: {
        translation: {
          'search.placeholder': 'Buscar trabajos...',
          'jobs.title': 'Ofertas de trabajo',
          'post.job': 'Publicar trabajo',
          'listings': 'Listados',
          'share': 'Compartir',
          'send.cv': 'Enviar CV',
          'days.remaining': '{{count}} días restantes',
          'expired': 'Expirado',
          'loading': 'Cargando trabajos...',
          'no.results': 'No se encontraron trabajos con los criterios seleccionados'
        }
      },
      de: {
        translation: {
          'search.placeholder': 'Jobs suchen...',
          'jobs.title': 'Stellenangebote',
          'post.job': 'Job veröffentlichen',
          'listings': 'Angebote',
          'share': 'Teilen',
          'send.cv': 'Lebenslauf senden',
          'days.remaining': 'Noch {{count}} Tage',
          'expired': 'Abgelaufen',
          'loading': 'Lade Jobs...',
          'no.results': 'Keine Jobs mit den ausgewählten Kriterien gefunden'
        }
      }
    }
  });

export default i18n;
