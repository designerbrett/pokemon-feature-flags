import React from 'react';
import Modal from 'react-modal';

const OptionsModal = ({ isOpen, onRequestClose, visibleOptions, handleOptionToggle }) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div>
        <button className="close-button" onClick={onRequestClose}>
          <span aria-hidden="true">&times;</span>
        </button>
        <h2>Turn On or Off any of the columns in the results display</h2>
        <label>
          <input type='checkbox' checked={visibleOptions.period} onChange={() => handleOptionToggle('period')} />
          Period
        </label>
        <label>
          <input type='checkbox' checked={visibleOptions.starting} onChange={() => handleOptionToggle('starting')} />
          Starting
        </label>
        <label>
          <input type='checkbox' checked={visibleOptions.compounding} onChange={() => handleOptionToggle('compounding')} />
          Compounding
        </label>
        <label>
          <input type='checkbox' checked={visibleOptions.contribution} onChange={() => handleOptionToggle('contribution')} />
          Contributions
        </label>
        <label>
          <input type='checkbox' checked={visibleOptions.total} onChange={() => handleOptionToggle('total')} />
          End Total
        </label>
      </div>
    </Modal>
  );
};

export default OptionsModal;
