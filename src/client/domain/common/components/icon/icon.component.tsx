import React, { memo } from 'react';
import cn from 'classnames';

import AccountIconSvg from '@assets/svg/icon-account.svg';
import AddCircleFilledIconSvg from '@assets/svg/icon-add-circle-filled.svg';
import CaratDownIconSvg from '@assets/svg/icon-carat-down.svg';
import CaratRightIconSvg from '@assets/svg/icon-carat-right.svg';
import CaratUpIconSvg from '@assets/svg/icon-carat-up.svg';
import ChartIconSvg from '@assets/svg/icon-chart.svg';
import CloseIconSvg from '@assets/svg/icon-close.svg';
import ErrorCircleOutlinedIconSvg from '@assets/svg/icon-error-circle-outlined.svg';
import IdeaIconSvg from '@assets/svg/icon-idea.svg';
import InfoCircleFilledIconSvg from '@assets/svg/icon-info-circle-filled.svg';
import LogoutIconSvg from '@assets/svg/icon-logout.svg';
import OrgIconSvg from '@assets/svg/icon-org.svg';
import PayablesIconSvg from '@assets/svg/icon-payables.svg';
import CreditCardSvg from '@assets/svg/icon-credit-card.svg';
import ReceivablesIconSvg from '@assets/svg/icon-receivables.svg';
import ShieldRefreshSvg from '@assets/svg/icon-shield-refresh.svg';
import CloudRefreshSvg from '@assets/svg/icon-cloud-refresh.svg';
import RubbishBinSvg from '@assets/svg/icon-rubbish-bin.svg';
import ShareIconSvg from '@assets/svg/icon-share.svg';
import TickCircleFilledIconSvg from '@assets/svg/icon-tick-circle-filled.svg';
import TickCircleOutlinedIconSvg from '@assets/svg/icon-tick-circle-outlined.svg';
import TickIconSvg from '@assets/svg/icon-tick.svg';
import WarningIconSvg from '@assets/svg/icon-warning.svg';
import ViewIconSvg from '@assets/svg/icon-view.svg';
import DeleteIconSvg from '@assets/svg/icon-delete.svg';
import EditIconSvg from '@assets/svg/icon-edit.svg';
import CsvIconSvg from '@assets/svg/csv-file.svg';
import FluencyLogoSvg from '@assets/svg/fluenccy-icon-logo.svg';
import HomeSvg from '@assets/svg/icon-home.svg';
import PasswordIconSvg from '@assets/svg/password-icon.svg';
import ArrowUpSvg from '@assets/svg/arrow-up-thin.svg';
import ArrowDownSvg from '@assets/svg/arrow-down-thin.svg';

type IconType =
  | 'account'
  | 'add-circle-filled'
  | 'carat-down'
  | 'carat-right'
  | 'carat-up'
  | 'chart'
  | 'close'
  | 'error-circle-outlined'
  | 'idea'
  | 'info-circle-filled'
  | 'logout'
  | 'org'
  | 'payables'
  | 'recalculate-scores'
  | 'receivables'
  | 'refresh-token'
  | 'resync-invoices'
  | 'rubbish-bin'
  | 'share'
  | 'tick-circle-filled'
  | 'tick-circle-outlined'
  | 'tick'
  | 'warning'
  | 'view'
  | 'delete'
  | 'edit'
  | 'csv-file'
  | 'fluenccy-logo'
  | 'home'
  | 'password'
  | 'arrow-down-thin'
  | 'arrow-up-thin';

type Props = {
  icon: IconType;
  className?: string;
  height?: number;
  width?: number;
  style?: object
};

const BASE_CLASSES = ['inline-block'];

export const Icon = memo(({ className, icon, height, width, ...props }: Props) => {
  const fillIconClasses = cn(className, BASE_CLASSES, 'fill-current');
  const strokeIconClasses = cn(className, BASE_CLASSES, 'stroke-current');

  switch (icon) {
    case 'account':
      return <AccountIconSvg className={fillIconClasses} width={width || 14} height={height || 15} {...props} />;
    case 'add-circle-filled':
      return <AddCircleFilledIconSvg className={fillIconClasses} width={width || 16} height={height || 16} {...props} />;
    case 'carat-down':
      return <CaratDownIconSvg className={fillIconClasses} width={width || 24} height={height || 24} {...props} />;
    case 'carat-right':
      return <CaratRightIconSvg className={fillIconClasses} width={width || 6} height={height || 10} {...props} />;
    case 'carat-up':
      return <CaratUpIconSvg className={fillIconClasses} width={width || 24} height={height || 24} {...props} />;
    case 'chart':
      return <ChartIconSvg className={strokeIconClasses} width={width || 24} height={height || 24} {...props} />;
    case 'close':
      return <CloseIconSvg className={fillIconClasses} width={width || 13} height={height || 13} {...props} />;
    case 'error-circle-outlined':
      return <ErrorCircleOutlinedIconSvg className={strokeIconClasses} width={width || 20} height={height || 20} {...props} />;
    case 'idea':
      return <IdeaIconSvg className={fillIconClasses} width={width || 16} height={height || 16} {...props} />;
    case 'info-circle-filled':
      return <InfoCircleFilledIconSvg className={fillIconClasses} width={width || 16} height={height || 16} {...props} />;
    case 'logout':
      return <LogoutIconSvg className={fillIconClasses} width={width || 16} height={height || 14} {...props} />;
    case 'org':
      return <OrgIconSvg className={fillIconClasses} width={width || 14} height={height || 16} {...props} />;
    case 'payables':
      return <PayablesIconSvg className={strokeIconClasses} width={width || 24} height={height || 24} {...props} />;
    case 'recalculate-scores':
      return <CreditCardSvg className={fillIconClasses} width={width || 20} height={height || 19} {...props} />;
    case 'receivables':
      return <ReceivablesIconSvg className={strokeIconClasses} width={width || 24} height={height || 24} {...props} />;
    case 'refresh-token':
      return <ShieldRefreshSvg className={fillIconClasses} width={width || 19} height={height || 22} {...props} />;
    case 'resync-invoices':
      return <CloudRefreshSvg className={fillIconClasses} width={width || 23} height={height || 19} {...props} />;
    case 'rubbish-bin':
      return <RubbishBinSvg className={fillIconClasses} width={width || 24} height={height || 24} {...props} />;
    case 'share':
      return <ShareIconSvg className={fillIconClasses} width={width || 16} height={height || 16} {...props} />;
    case 'tick-circle-filled':
      return <TickCircleFilledIconSvg className={fillIconClasses} width={width || 18} height={height || 18} {...props} />;
    case 'tick-circle-outlined':
      return <TickCircleOutlinedIconSvg className={strokeIconClasses} width={width || 20} height={height || 20} {...props} />;
    case 'tick':
      return <TickIconSvg className={fillIconClasses} width={width || 8} height={height || 6} {...props} />;
    case 'warning':
      return <WarningIconSvg className={fillIconClasses} width={width || 16} height={height || 14} {...props} />;
    case 'view':
      return <ViewIconSvg className={fillIconClasses} width={width || 20} height={height || 16} {...props} />;
    case 'delete':
      return <DeleteIconSvg className={fillIconClasses} width={width || 20} height={height || 16} {...props} />;
    case 'edit':
      return <EditIconSvg className={fillIconClasses} width={width || 20} height={height || 16} {...props} {...props} />;
    case 'csv-file':
      return <CsvIconSvg className={fillIconClasses} width={width || 20} height={height || 16} {...props} {...props} />;
    case 'fluenccy-logo':
      return <FluencyLogoSvg className={fillIconClasses} width={width || 28} height={height || 16} {...props} {...props} />;
    case 'home':
      return <HomeSvg className={fillIconClasses} width={width || 28} height={height || 16} {...props} {...props} />;
    case 'password':
      return <PasswordIconSvg className={fillIconClasses} width={width || 14} height={height || 15} {...props} />;
    case 'arrow-up-thin':
      return <ArrowUpSvg className={fillIconClasses} width={width || 14} height={height || 15} {...props} />;
    case 'arrow-down-thin':
      return <ArrowDownSvg className={fillIconClasses} width={width || 14} height={height || 15} {...props} />;
    default:
      return <></>;
  }
});
