const updateUI = (elements, state, i18nInstance) => {
  const {
    form, fields, submitButton, feedbackElement,
  } = elements;
  const { processState, error } = state.form;

  const resetUI = () => {
    submitButton.disabled = false;
    fields.url.classList.remove('is-invalid');
    feedbackElement.classList.remove('text-danger', 'text-success');
    feedbackElement.textContent = '';
  };

  switch (processState) {
    case 'sent':
      resetUI();
      form.reset();
      fields.url.focus();
      feedbackElement.classList.add('text-success');
      feedbackElement.textContent = i18nInstance.t('urlLoadedSuccessfully');
      break;

    case 'error':
      resetUI();
      fields.url.classList.add('is-invalid');
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

const render = (elements, initialState, i18nInstance) => (path) => {
  if (path === 'form.processState') {
    updateUI(elements, initialState, i18nInstance);
  }
};

export default render;
