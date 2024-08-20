const handleProcessState = (elements, processState, errorMessage) => {
  const {
    form, fields, submitButton, feedbackElement,
  } = elements;

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
      feedbackElement.textContent = 'done';
      break;

    case 'error':
      resetUI();
      fields.url.classList.add('is-invalid');
      feedbackElement.classList.add('text-danger');
      feedbackElement.textContent = errorMessage || 'Unknown error';
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

const render = (elements, initialState) => (path, value) => {
  if (path === 'form.processState') {
    handleProcessState(elements, value, initialState.form.error);
  }
};

export default render;
