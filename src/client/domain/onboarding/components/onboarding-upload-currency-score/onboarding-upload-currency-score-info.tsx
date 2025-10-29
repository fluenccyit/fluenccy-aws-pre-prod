import React from 'react';

const UploadOnboardingCurrencyScoreInfo = ({ title, icon, subTitle }) => {
  return (
    <div className="flex items-center flex-col">
      <img className="w-24 h-24" src={icon} alt="Hand holding single bar from graph" />
      <span className="my-4" style={{ fontWeight: 'bold', opacity: '0.8' }}>
        {title}
      </span>
      <span style={{ textAlign: 'center', fontSize: '14px', fontWeight: '500', opacity: 0.6, lineHeight: '24px' }}>{subTitle}</span>
    </div>
  );
};

export default UploadOnboardingCurrencyScoreInfo;
