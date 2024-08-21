import 'bootstrap';
import i18n from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import uniqueId from 'lodash.uniqueid';
import resources from './locales/index.js';
import render from './view.js';

// Асинхронная валидация URL
const validateUrl = async (url, urlsList) => {
  const urlSchema = yup.string().url('invalidUrlFormat').required('urlIsRequired').notOneOf(urlsList, 'urlIsDuplicate');
  try {
    await urlSchema.validate(url, { abortEarly: false });
    return null;
  } catch (error) {
    return error.message;
  }
};

// Основная функция приложения
const app = async () => {
  const defaultLanguage = 'ru';
  const i18nInstance = i18n.createInstance();
  await i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  const elements = {
    form: document.querySelector('.rss-form'),
    fields: {
      url: document.getElementById('url-input'),
    },
    feedbackElement: document.querySelector('p.feedback'),
    submitButton: document.querySelector('button[type="submit"]'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
  };

  const initialState = {
    feeds: [],
    posts: [],
    form: {
      processState: 'filling',
      processError: null,
      error: null,
    },
  };

  const state = onChange(initialState, render(elements, initialState, i18nInstance));

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    state.form.processState = 'sending';
    state.form.processError = null;

    const formData = new FormData(e.target);
    const url = formData.get('url');
    const urlsList = state.feeds.map((feed) => feed.url);

    const error = await validateUrl(url, urlsList);
    if (error) {
      state.form.error = error;
      state.form.processState = 'error';
    } else {
      state.feeds.push({ id: uniqueId(), url });
      state.form.processState = 'sent';
    }
  });

  elements.postsContainer.addEventListener('click', (e) => {
    e.preventDefault();
    // Обработка кликов: добавьте вашу логику здесь
  });
};

export default app;
