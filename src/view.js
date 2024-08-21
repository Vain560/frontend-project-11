const handleProcessState = (elements, processState, error, i18nInstance) => {
  const {
    form, fields, submitButton, feedbackElement,
  } = elements;

  switch (processState) {
    case 'sent':
      submitButton.disabled = false;
      form.reset();
      fields.url.classList.remove('is-invalid');
      fields.url.focus();
      feedbackElement.classList.remove('text-danger');
      feedbackElement.classList.add('text-success');
      feedbackElement.textContent = i18nInstance.t('urlLoadedSuccessfully');
      break;

    case 'error':
      submitButton.disabled = false;
      fields.url.classList.add('is-invalid');
      feedbackElement.classList.remove('text-success');
      feedbackElement.classList.add('text-danger');
      feedbackElement.textContent = i18nInstance.t(error);
      break;

    case 'sending':
      submitButton.disabled = true;
      break;

    case 'filling':
      submitButton.disabled = false;
      break;

    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const renderPosts = (elements, posts, i18nInstance) => {
  const { postsContainer } = elements;
  postsContainer.innerHTML = '';

  const cardPosts = document.createElement('div');
  cardPosts.classList.add('card', 'border-0');
  postsContainer.append(cardPosts);

  const cardPostsBody = document.createElement('div');
  cardPostsBody.classList.add('card-body');
  cardPosts.append(cardPostsBody);

  const cardPostsTitle = document.createElement('h2');
  cardPostsTitle.classList.add('card-title', 'h4');
  cardPostsTitle.textContent = i18nInstance.t('posts');
  cardPostsBody.append(cardPostsTitle);

  const ulPosts = document.createElement('ul');
  ulPosts.classList.add('list-group', 'border-0', 'rounded-0');
  cardPosts.append(ulPosts);

  const liPosts = posts.map((post) => {
    const liPost = document.createElement('li');
    liPost.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const aPost = document.createElement('a');
    aPost.classList.add('fw-bold');
    aPost.href = post.link;
    aPost.rel = 'noopener noreferrer';
    aPost.target = '_blank';
    aPost.textContent = post.title;

    const buttonPost = document.createElement('button');
    buttonPost.type = 'button';
    buttonPost.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    buttonPost.setAttribute('data-bs-toggle', 'modal');
    buttonPost.setAttribute('data-bs-target', '#modal');
    buttonPost.textContent = i18nInstance.t('view');

    liPost.append(aPost, buttonPost);
    return liPost;
  });

  ulPosts.append(...liPosts);
};

const renderFeeds = (elements, feeds, i18nInstance) => {
  const { feedsContainer } = elements;
  feedsContainer.innerHTML = '';

  const cardFeeds = document.createElement('div');
  cardFeeds.classList.add('card', 'border-0');
  feedsContainer.append(cardFeeds);

  const cardFeedsBody = document.createElement('div');
  cardFeedsBody.classList.add('card-body');
  cardFeeds.append(cardFeedsBody);

  const cardFeedsTitle = document.createElement('h2');
  cardFeedsTitle.classList.add('card-title', 'h4');
  cardFeedsTitle.textContent = i18nInstance.t('feeds');
  cardFeedsBody.append(cardFeedsTitle);

  const ulFeeds = document.createElement('ul');
  ulFeeds.classList.add('list-group', 'border-0', 'rounded-0');
  cardFeeds.append(ulFeeds);

  const liFeeds = feeds.map((feed) => {
    const liFeed = document.createElement('li');
    liFeed.classList.add('list-group-item', 'border-0', 'border-end-0');

    const h3Feed = document.createElement('h3');
    h3Feed.classList.add('h6', 'm-0');
    h3Feed.textContent = feed.title;

    const pFeed = document.createElement('p');
    pFeed.classList.add('m-0', 'small', 'text-black-50');
    pFeed.textContent = feed.description;

    liFeed.append(h3Feed, pFeed);
    return liFeed;
  });

  ulFeeds.append(...liFeeds);
};

const render = (elements, initialState, i18nInstance) => (path, value) => {
  switch (path) {
    case 'form.processState':
      handleProcessState(elements, value, initialState.form.error, i18nInstance);
      break;

    case 'posts':
      renderPosts(elements, value, i18nInstance);
      break;

    case 'feeds':
      renderFeeds(elements, value, i18nInstance);
      break;

    default:
      break;
  }
};

export default render;
