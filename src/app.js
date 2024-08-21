import 'bootstrap';
import i18n from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import _ from 'lodash';
import resources from './locales/index.js';
import render from './view.js';

const PROXY_URL = 'https://allorigins.hexlet.app/get?disableCache=true&url=';

const buildProxyUrl = (url) => `${PROXY_URL}${encodeURIComponent(url)}`;

const parseRSS = (xml) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, 'text/xml');

  return {
    title: xmlDoc.querySelector('title')?.textContent || '',
    link: xmlDoc.querySelector('link')?.textContent || '',
    description: xmlDoc.querySelector('description')?.textContent || '',
    posts: Array.from(xmlDoc.querySelectorAll('item')).map((item) => ({
      title: item.querySelector('title')?.textContent || '',
      link: item.querySelector('link')?.textContent || '',
      description: item.querySelector('description')?.textContent || '',
    })),
  };
};

const loadRss = async (url, state) => {
  try {
    const { data } = await axios.get(buildProxyUrl(url));
    const { contents } = data;

    if (!contents || data.status.http_code !== 200) {
      throw new Error(`Failed to load RSS from ${url}`);
    }

    const parsedContent = parseRSS(contents);
    const feedId = _.uniqueId();

    state.feeds.push({
      id: feedId,
      url,
      ...parsedContent,
    });

    const postsToAdd = parsedContent.posts.map((post) => ({
      feedId,
      id: _.uniqueId(),
      ...post,
    }));

    state.posts = _.unionBy(state.posts, postsToAdd, (post) => `${post.feedId}-${post.title}-${post.link}`);

    state.form.error = null;
    state.form.processState = 'sent';
  } catch (error) {
    state.form.error = error.message.includes('Failed to load') ? 'urlDownloadError' : 'networkError';
    state.form.processState = 'error';
  }
};

const updateRss = (state) => {
  const fetchFeeds = async () => {
    if (state.form.processState === 'sending') return;

    await Promise.all(state.feeds.map(async (feed) => {
      try {
        const { data } = await axios.get(buildProxyUrl(feed.url));
        const { contents } = data;

        if (!contents || data.status.http_code !== 200) {
          throw new Error(`Failed to load RSS from ${feed.url}`);
        }

        const parsedContent = parseRSS(contents);
        const postsToAdd = parsedContent.posts.map((post) => ({
          feedId: feed.id,
          id: _.uniqueId(),
          ...post,
        }));

        state.posts = _.unionBy(state.posts, postsToAdd, (post) => `${post.feedId}-${post.title}-${post.link}`);
      } catch (error) {
        console.error(error.message);
      }
    }));

    setTimeout(fetchFeeds, 5000);
  };

  fetchFeeds();
};

const validateUrl = (url, urlsList) => {
  const schema = yup.string().url('invalidUrlFormat').required('urlIsRequired').notOneOf(urlsList, 'urlIsDuplicate');
  return schema.validate(url, { abortEarly: false });
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
    fields: { url: document.getElementById('url-input') },
    feedbackElement: document.querySelector('p.feedback'),
    submitButton: document.querySelector('button[type="submit"]'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    modal: {
      modalTitle: document.querySelector('.modal-title'),
      modalBody: document.querySelector('.modal-body'),
      modalLink: document.querySelector('.modal-footer > .full-article'),
    },
  };

  const initialState = {
    feeds: [],
    posts: [],
    form: { error: null, processState: 'filling' },
    uiState: { clickedDataId: null, clickedIds: new Set() },
  };

  const state = onChange(initialState, render(elements, initialState, i18nInstance));

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    state.form.error = null;
    state.form.processState = 'sending';
    
    const url = new FormData(e.target).get('url');
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
    const clickedDataId = e.target.getAttribute('data-id');
    if (clickedDataId) {
      state.uiState.clickedDataId = clickedDataId;
      state.uiState.clickedIds.add(clickedDataId);
    }
  });

  updateRss(state);
};

export default app;
