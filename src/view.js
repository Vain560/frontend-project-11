const setButtonState = (submitButton, isDisabled) => {
  submitButton.disabled = isDisabled;
};

const setFeedbackClass = (feedbackElement, state) => {
  const isError = state === 'error';
  feedbackElement.classList.toggle('text-danger', isError);
  feedbackElement.classList.toggle('text-success', !isError);
};

const setFeedbackText = (feedbackElement, text) => {
  feedbackElement.textContent = text;
};

const updateProcessState = (elements, state, i18nInstance) => {
  const {
    form, fields, submitButton, feedbackElement,
  } = elements;

  const { processState } = state.form;

  switch (processState) {
    case 'sent':
      setButtonState(submitButton, false);
      form.reset();
      fields.url.classList.remove('is-invalid');
      setFeedbackClass(feedbackElement, 'sent');
      setFeedbackText(feedbackElement, i18nInstance.t('urlLoadedSuccessfully'));
      break;
    case 'error':
      setButtonState(submitButton, false);
      fields.url.classList.add('is-invalid');
      setFeedbackClass(feedbackElement, 'error');
      setFeedbackText(feedbackElement, i18nInstance.t(state.form.error));
      break;
    case 'sending':
      setButtonState(submitButton, true);
      break;
    case 'filling':
      setButtonState(submitButton, false);
      break;
    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const createPostsTitle = (i18nInstance) => {
  const postsTitle = document.createElement('h2');
  postsTitle.textContent = i18nInstance.t('postsTitle');
  return postsTitle;
};

const createPostItem = (post, uiState, i18nInstance) => {
  const postItem = document.createElement('li');
  postItem.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0';

  const postLink = document.createElement('a');
  postLink.href = post.link;
  postLink.textContent = post.title;
  postLink.className = uiState.clickedIds.has(post.id) ? 'fw-normal link-secondary' : 'fw-bold';
  postLink.setAttribute('data-id', post.id);
  postLink.setAttribute('rel', 'noopener noreferrer');
  postLink.setAttribute('target', '_blank');

  const viewButton = document.createElement('button');
  viewButton.type = 'button';
  viewButton.className = 'btn btn-outline-primary btn-sm';
  viewButton.textContent = i18nInstance.t('view');
  viewButton.setAttribute('data-id', post.id);
  viewButton.setAttribute('data-bs-toggle', 'modal');
  viewButton.setAttribute('data-bs-target', '#modal');

  postItem.append(postLink, viewButton);
  return postItem;
};

const renderPosts = (elements, state, i18nInstance) => {
  const { postsContainer } = elements;
  postsContainer.innerHTML = '';

  const postsTitle = createPostsTitle(i18nInstance);
  postsContainer.append(postsTitle);

  const postList = document.createElement('ul');
  postList.className = 'list-group border-0 rounded-0';
  postsContainer.append(postList);

  state.posts.forEach((post) => {
    const postItem = createPostItem(post, state.uiState, i18nInstance);
    postList.append(postItem);
  });
};

const renderFeeds = (elements, state, i18nInstance) => {
  const { feedsContainer } = elements;
  feedsContainer.innerHTML = '';

  const feedsTitle = document.createElement('h2');
  feedsTitle.textContent = i18nInstance.t('feedsTitle');
  feedsContainer.append(feedsTitle);

  const feedList = document.createElement('ul');
  feedList.className = 'list-group border-0 rounded-0';
  feedsContainer.append(feedList);

  state.feeds.forEach((feed) => {
    const feedItem = document.createElement('li');
    feedItem.className = 'list-group-item border-0 border-end-0';

    const feedTitle = document.createElement('h3');
    feedTitle.className = 'h6 m-0';
    feedTitle.textContent = feed.title;

    const feedDescription = document.createElement('p');
    feedDescription.className = 'm-0 small text-black-50';
    feedDescription.textContent = feed.description;

    feedItem.append(feedTitle, feedDescription);
    feedList.append(feedItem);
  });
};

const updateModal = (elements, state) => {
  const { clickedDataId } = state.uiState;
  const clickedPost = state.posts.find((post) => post.id === clickedDataId);

  if (clickedPost) {
    const { modalTitle, modalBody, modalLink } = elements.modal;
    modalTitle.textContent = clickedPost.title;
    modalBody.textContent = clickedPost.description;
    modalLink.href = clickedPost.link;
  }
};

const render = (elements, state, i18nInstance) => (path) => {
  switch (path) {
    case 'form.processState':
      updateProcessState(elements, state, i18nInstance);
      break;
    case 'posts':
      renderPosts(elements, state, i18nInstance);
      break;
    case 'feeds':
      renderFeeds(elements, state, i18nInstance);
      break;
    case 'uiState.clickedDataId':
      updateModal(elements, state);
      break;
    default:
      break;
  }
};

export default render;
