import 'bootstrap';
import i18n from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import _ from 'lodash';
import resources from './locales/index.js';
import render from './view.js';

const buildProxyUrl = (url) => {
  const proxy = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
  const encodedUrl = encodeURIComponent(url);
  return `${proxy}${encodedUrl}`;
};

const parseRSS = (xml) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, 'text/xml');

  const title = xmlDoc.querySelector('title').textContent;
  const description = xmlDoc.querySelector('description').textContent;
  const link = xmlDoc.querySelector('link').textContent;

  const posts = Array.from(xmlDoc.querySelectorAll('item')).map((post) => ({
    title: post.querySelector('title').textContent,
    link: post.querySelector('link').textContent,
    description: post.querySelector('description').textContent,
  }));

  return {
    title, description, link, posts,
  };
};

const loadRss = async (url, state) => {
  const proxyUrl = buildProxyUrl(url);
  try {
    const response = await axios.get(proxyUrl);
    if (!response.data.contents) {
      throw new Error('urlDownloadError');
    }
    const parsedContent = parseRSS(response.data.contents);
    const {
      description, title, link, posts,
    } = parsedContent;

    const id = _.uniqueId();
    state.feeds.push({
      id, url, description, title, link,
    });

    const postsToAdd = posts.map((post) => ({ id, ...post }));
    state.posts = _.unionWith(state.posts, postsToAdd, _.isEqual);

    state.form.error = null;
    state.form.processState = 'sent';
  } catch (error) {
    state.form.error = error.code === 'ERR_NETWORK' ? 'networkError' : 'urlDownloadError';
    state.form.processState = 'error';
  }
};

const validateUrl = async (url, urlsList) => {
  const urlSchema = yup.string().url('invalidUrlFormat').required('urlIsRequired').notOneOf(urlsList, 'urlIsDuplicate');
  return urlSchema.validate(url, { abortEarly: false });
};

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
      error: null,
      processState: 'filling',
    },
  };

  const state = onChange(initialState, render(elements, initialState, i18nInstance));

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    state.form.error = null;
    state.form.processState = 'sending';

    const formData = new FormData(e.target);
    const url = formData.get('url');
    const urlsList = state.feeds.map((feed) => feed.url);

    try {
      await validateUrl(url, urlsList);
      await loadRss(url, state);
    } catch (error) {
      state.form.error = error.message;
      state.form.processState = 'error';
    }
  });

  elements.postsContainer.addEventListener('click', (e) => {
    e.preventDefault();
    // Обработка кликов по постам, если это необходимо
  });
};

export default app;
