import 'bootstrap';
import i18n from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import _ from 'lodash';
import axios from 'axios';
import resources from './locales/index.js';
import render from './view.js';
import parseRSS from './parser.js';

const buildProxyUrl = (url) => {
  const proxy = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
  return `${proxy}${encodeURIComponent(url)}`;
};

const mergePosts = (existingPosts, newPosts) => _.unionBy(existingPosts, newPosts, (post) => `${post.feedId}-${post.title}-${post.link}`);

const loadRss = (url, state) => {
  const proxyUrl = buildProxyUrl(url);
  axios.get(proxyUrl)
    .then((response) => {
      if (response.status !== 200 || !response.data.contents) {
        throw new Error(`urlDownloadError: ${proxyUrl}`);
      }
      const parsedContent = parseRSS(response.data.contents);
      const {
        title, link, description, posts,
      } = parsedContent;
      const feedId = _.uniqueId();
      state.feeds.push({
        id: feedId, url, title, link, description,
      });

      const postsToAdd = posts.map((post) => ({ feedId, id: _.uniqueId(), ...post }));
      state.posts = mergePosts(state.posts, postsToAdd);
      state.form.error = null;
      state.form.processState = 'sent';
    })
    .catch((error) => {
      state.form.error = error.isParseError ? 'urlDownloadError' : 'networkError';
      state.form.processState = 'error';
    });
};

const updateRss = (state) => {
  const updateFeeds = () => {
    if (state.form.processState === 'sending') return;

    const feedPromises = state.feeds.map((feed) => {
      const proxyUrl = buildProxyUrl(feed.url);
      return axios.get(proxyUrl)
        .then((response) => {
          const { contents } = response.data;
          if (!contents || response.data.status.http_code !== 200) {
            throw new Error(`urlDownloadError: ${proxyUrl}`);
          }
          return parseRSS(contents);
        })
        .then((parsedContent) => {
          const { posts } = parsedContent;
          const postsToAdd = posts.map((post) => ({ feedId: feed.id, id: _.uniqueId(), ...post }));
          state.posts = mergePosts(state.posts, postsToAdd);
        })
        .catch((error) => {
          console.error(error);
        });
    });

    Promise.all(feedPromises).then(() => {
      setTimeout(updateFeeds, 5000);
    });
  };

  updateFeeds();
};

const validateUrl = (url, urlsList) => {
  const urlSchema = yup.string().url('invalidUrlFormat').required('urlIsRequired').notOneOf(urlsList, 'urlIsDuplicate');
  return urlSchema.validate(url, { abortEarly: false });
};

const setupEventListeners = (elements, state) => {
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.form.error = null;
    state.form.processState = 'sending';
    const url = new FormData(e.target).get('url');
    const urlsList = state.feeds.map((feed) => feed.url);
    validateUrl(url, urlsList)
      .then(() => loadRss(url, state))
      .catch((error) => {
        state.form.error = error.message;
        state.form.processState = 'error';
      });
  });

  elements.postsContainer.addEventListener('click', (e) => {
    const clickedDataId = e.target.getAttribute('data-id');
    state.uiState.clickedDataId = clickedDataId;
    state.uiState.clickedIds.add(clickedDataId);
  });
};

const initializeApp = async () => {
  const defaultLanguage = 'ru';
  const i18nInstance = i18n.createInstance();
  await i18nInstance.init({ lng: defaultLanguage, debug: false, resources });

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

  setupEventListeners(elements, state);
  updateRss(state);
};

export default initializeApp;
