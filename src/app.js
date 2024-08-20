import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';

// Валидация URL
const validateUrl = async (url, urlsList) => {
  const urlSchema = yup.string().url().nullable().notOneOf(urlsList, 'URL is duplicate');
  try {
    await urlSchema.validate(url, { abortEarly: false });
    return null;
  } catch (error) {
    return error.message;
  }
};

// Инициализация приложения
const app = () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    fields: {
      url: document.getElementById('url-input'),
    },
    feedbackElement: document.querySelector('p.feedback'),
    submitButton: document.querySelector('button[type="submit"]'),
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

  const state = onChange(initialState, render(elements, initialState));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');

    state.form.processState = 'sending';
    state.form.processError = null;

    const error = await validateUrl(url, state.feeds);
    state.form.error = error;

    if (error) {
      state.form.processState = 'error';
      return;
    }

    state.feeds.push(url);
    state.form.processState = 'sent';
  };

  elements.form.addEventListener('submit', handleSubmit);
};

export default app;
