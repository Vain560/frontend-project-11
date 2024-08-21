const updateProcessState = (elements, state, i18nInstance) => {
  const {
    form, fields, submitButton, feedbackElement,
  } = elements;

  switch (state.form.processState) {
    case 'sent':
      submitButton.disabled = false;
      form.reset();
      fields.url.classList.remove('is-invalid');
      feedbackElement.classList.remove('text-danger');
      feedbackElement.classList.add('text-success');
      feedbackElement.textContent = i18nInstance.t('urlLoadedSuccessfully');
      break;
    case 'error':
      submitButton.disabled = false;
      fields.url.classList.add('is-invalid');
      feedbackElement.classList.remove('text-success');
      feedbackElement.classList.add('text-danger');
      feedbackElement.textContent = i18nInstance.t(state.form.error);
      break;
    case 'sending':
      submitButton.disabled = true;
      break;
    case 'filling':
      submitButton.disabled = false;
      break;
    default:
      throw new Error(`Unknown process state: ${state.form.processState}`);
  }
};

const renderPosts = (elements, state, i18nInstance) => {
  const { postsContainer } = elements;
  postsContainer.innerHTML = '';

  const postList = document.createElement('ul');
  postList.className = 'list-group border-0 rounded-0';
  postsContainer.append(postList);

  state.posts.forEach((post) => {
    const postItem = document.createElement('li');
    postItem.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0';

    const postLink = document.createElement('a');
    postLink.href = post.link;
    postLink.textContent = post.title;
    postLink.className = state.uiState.clickedIds.has(post.id) ? 'fw-normal link-secondary' : 'fw-bold';
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
    postList.append(postItem);
  });

  const { feedsContainer } = elements;
  feedsContainer.innerHTML = '';

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
    case 'uiState.clickedDataId':
      updateModal(elements, state);
      break;
    default:
      break;
  }
};

export default render;
