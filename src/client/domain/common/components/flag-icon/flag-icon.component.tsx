import React, { memo } from 'react';
import cn from 'classnames';
import { GqlSupportedCurrency } from '@graphql';

import AcFlagSvg from '@assets/svg/flag-ac.svg';
import AdFlagSvg from '@assets/svg/flag-ad.svg';
import AeFlagSvg from '@assets/svg/flag-ae.svg';
import AfFlagSvg from '@assets/svg/flag-af.svg';
import AgFlagSvg from '@assets/svg/flag-ag.svg';
import AiFlagSvg from '@assets/svg/flag-ai.svg';
import AlFlagSvg from '@assets/svg/flag-al.svg';
import AmFlagSvg from '@assets/svg/flag-am.svg';
import AoFlagSvg from '@assets/svg/flag-ao.svg';
import AqFlagSvg from '@assets/svg/flag-aq.svg';
import ArFlagSvg from '@assets/svg/flag-ar.svg';
import AsFlagSvg from '@assets/svg/flag-as.svg';
import AtFlagSvg from '@assets/svg/flag-at.svg';
import AuFlagSvg from '@assets/svg/flag-au.svg';
import AwFlagSvg from '@assets/svg/flag-aw.svg';
import AxFlagSvg from '@assets/svg/flag-ax.svg';
import AzFlagSvg from '@assets/svg/flag-az.svg';
import BaFlagSvg from '@assets/svg/flag-ba.svg';
import BbFlagSvg from '@assets/svg/flag-bb.svg';
import BdFlagSvg from '@assets/svg/flag-bd.svg';
import BeFlagSvg from '@assets/svg/flag-be.svg';
import BfFlagSvg from '@assets/svg/flag-bf.svg';
import BgFlagSvg from '@assets/svg/flag-bg.svg';
import BhFlagSvg from '@assets/svg/flag-bh.svg';
import BiFlagSvg from '@assets/svg/flag-bi.svg';
import BjFlagSvg from '@assets/svg/flag-bj.svg';
import BlFlagSvg from '@assets/svg/flag-bl.svg';
import BmFlagSvg from '@assets/svg/flag-bm.svg';
import BnFlagSvg from '@assets/svg/flag-bn.svg';
import BoFlagSvg from '@assets/svg/flag-bo.svg';
import BqFlagSvg from '@assets/svg/flag-bq.svg';
import BrFlagSvg from '@assets/svg/flag-br.svg';
import BsFlagSvg from '@assets/svg/flag-bs.svg';
import BtFlagSvg from '@assets/svg/flag-bt.svg';
import BvFlagSvg from '@assets/svg/flag-bv.svg';
import BwFlagSvg from '@assets/svg/flag-bw.svg';
import ByFlagSvg from '@assets/svg/flag-by.svg';
import BzFlagSvg from '@assets/svg/flag-bz.svg';
import CaFlagSvg from '@assets/svg/flag-ca.svg';
import CcFlagSvg from '@assets/svg/flag-cc.svg';
import CdFlagSvg from '@assets/svg/flag-cd.svg';
import CfFlagSvg from '@assets/svg/flag-cf.svg';
import CgFlagSvg from '@assets/svg/flag-cg.svg';
import ChFlagSvg from '@assets/svg/flag-ch.svg';
import CiFlagSvg from '@assets/svg/flag-ci.svg';
import CkFlagSvg from '@assets/svg/flag-ck.svg';
import ClFlagSvg from '@assets/svg/flag-cl.svg';
import CmFlagSvg from '@assets/svg/flag-cm.svg';
import CnFlagSvg from '@assets/svg/flag-cn.svg';
import CoFlagSvg from '@assets/svg/flag-co.svg';
import CpFlagSvg from '@assets/svg/flag-cp.svg';
import CrFlagSvg from '@assets/svg/flag-cr.svg';
import CuFlagSvg from '@assets/svg/flag-cu.svg';
import CvFlagSvg from '@assets/svg/flag-cv.svg';
import CwFlagSvg from '@assets/svg/flag-cw.svg';
import CxFlagSvg from '@assets/svg/flag-cx.svg';
import CyFlagSvg from '@assets/svg/flag-cy.svg';
import CzFlagSvg from '@assets/svg/flag-cz.svg';
import DeFlagSvg from '@assets/svg/flag-de.svg';
import DgFlagSvg from '@assets/svg/flag-dg.svg';
import DjFlagSvg from '@assets/svg/flag-dj.svg';
import DkFlagSvg from '@assets/svg/flag-dk.svg';
import DmFlagSvg from '@assets/svg/flag-dm.svg';
import DoFlagSvg from '@assets/svg/flag-do.svg';
import DzFlagSvg from '@assets/svg/flag-dz.svg';
import EaFlagSvg from '@assets/svg/flag-ea.svg';
import EcFlagSvg from '@assets/svg/flag-ec.svg';
import EeFlagSvg from '@assets/svg/flag-ee.svg';
import EgFlagSvg from '@assets/svg/flag-eg.svg';
import EhFlagSvg from '@assets/svg/flag-eh.svg';
import ErFlagSvg from '@assets/svg/flag-er.svg';
import EsFlagSvg from '@assets/svg/flag-es.svg';
import EsCtFlagSvg from '@assets/svg/flag-es-ct.svg';
import EsGaFlagSvg from '@assets/svg/flag-es-ga.svg';
import EtFlagSvg from '@assets/svg/flag-et.svg';
import EuFlagSvg from '@assets/svg/flag-eu.svg';
import FiFlagSvg from '@assets/svg/flag-fi.svg';
import FjFlagSvg from '@assets/svg/flag-fj.svg';
import FkFlagSvg from '@assets/svg/flag-fk.svg';
import FmFlagSvg from '@assets/svg/flag-fm.svg';
import FoFlagSvg from '@assets/svg/flag-fo.svg';
import FrFlagSvg from '@assets/svg/flag-fr.svg';
import GaFlagSvg from '@assets/svg/flag-ga.svg';
import GbFlagSvg from '@assets/svg/flag-gb.svg';
import GbEngFlagSvg from '@assets/svg/flag-gb-eng.svg';
import GbNirFlagSvg from '@assets/svg/flag-gb-nir.svg';
import GbSctFlagSvg from '@assets/svg/flag-gb-sct.svg';
import GbWlsFlagSvg from '@assets/svg/flag-gb-wls.svg';
import GdFlagSvg from '@assets/svg/flag-gd.svg';
import GeFlagSvg from '@assets/svg/flag-ge.svg';
import GfFlagSvg from '@assets/svg/flag-gf.svg';
import GgFlagSvg from '@assets/svg/flag-gg.svg';
import GhFlagSvg from '@assets/svg/flag-gh.svg';
import GiFlagSvg from '@assets/svg/flag-gi.svg';
import GlFlagSvg from '@assets/svg/flag-gl.svg';
import GmFlagSvg from '@assets/svg/flag-gm.svg';
import GnFlagSvg from '@assets/svg/flag-gn.svg';
import GpFlagSvg from '@assets/svg/flag-gp.svg';
import GqFlagSvg from '@assets/svg/flag-gq.svg';
import GrFlagSvg from '@assets/svg/flag-gr.svg';
import GsFlagSvg from '@assets/svg/flag-gs.svg';
import GtFlagSvg from '@assets/svg/flag-gt.svg';
import GuFlagSvg from '@assets/svg/flag-gu.svg';
import GwFlagSvg from '@assets/svg/flag-gw.svg';
import GyFlagSvg from '@assets/svg/flag-gy.svg';
import HkFlagSvg from '@assets/svg/flag-hk.svg';
import HmFlagSvg from '@assets/svg/flag-hm.svg';
import HnFlagSvg from '@assets/svg/flag-hn.svg';
import HrFlagSvg from '@assets/svg/flag-hr.svg';
import HtFlagSvg from '@assets/svg/flag-ht.svg';
import HuFlagSvg from '@assets/svg/flag-hu.svg';
import IcFlagSvg from '@assets/svg/flag-ic.svg';
import IdFlagSvg from '@assets/svg/flag-id.svg';
import IeFlagSvg from '@assets/svg/flag-ie.svg';
import IlFlagSvg from '@assets/svg/flag-il.svg';
import ImFlagSvg from '@assets/svg/flag-im.svg';
import InFlagSvg from '@assets/svg/flag-in.svg';
import IoFlagSvg from '@assets/svg/flag-io.svg';
import IqFlagSvg from '@assets/svg/flag-iq.svg';
import IrFlagSvg from '@assets/svg/flag-ir.svg';
import IsFlagSvg from '@assets/svg/flag-is.svg';
import ItFlagSvg from '@assets/svg/flag-it.svg';
import JeFlagSvg from '@assets/svg/flag-je.svg';
import JmFlagSvg from '@assets/svg/flag-jm.svg';
import JoFlagSvg from '@assets/svg/flag-jo.svg';
import JpFlagSvg from '@assets/svg/flag-jp.svg';
import KeFlagSvg from '@assets/svg/flag-ke.svg';
import KgFlagSvg from '@assets/svg/flag-kg.svg';
import KhFlagSvg from '@assets/svg/flag-kh.svg';
import KiFlagSvg from '@assets/svg/flag-ki.svg';
import KmFlagSvg from '@assets/svg/flag-km.svg';
import KnFlagSvg from '@assets/svg/flag-kn.svg';
import KpFlagSvg from '@assets/svg/flag-kp.svg';
import KrFlagSvg from '@assets/svg/flag-kr.svg';
import KwFlagSvg from '@assets/svg/flag-kw.svg';
import KyFlagSvg from '@assets/svg/flag-ky.svg';
import KzFlagSvg from '@assets/svg/flag-kz.svg';
import LaFlagSvg from '@assets/svg/flag-la.svg';
import LbFlagSvg from '@assets/svg/flag-lb.svg';
import LcFlagSvg from '@assets/svg/flag-lc.svg';
import LiFlagSvg from '@assets/svg/flag-li.svg';
import LkFlagSvg from '@assets/svg/flag-lk.svg';
import LrFlagSvg from '@assets/svg/flag-lr.svg';
import LsFlagSvg from '@assets/svg/flag-ls.svg';
import LtFlagSvg from '@assets/svg/flag-lt.svg';
import LuFlagSvg from '@assets/svg/flag-lu.svg';
import LvFlagSvg from '@assets/svg/flag-lv.svg';
import LyFlagSvg from '@assets/svg/flag-ly.svg';
import MaFlagSvg from '@assets/svg/flag-ma.svg';
import McFlagSvg from '@assets/svg/flag-mc.svg';
import MdFlagSvg from '@assets/svg/flag-md.svg';
import MeFlagSvg from '@assets/svg/flag-me.svg';
import MfFlagSvg from '@assets/svg/flag-mf.svg';
import MgFlagSvg from '@assets/svg/flag-mg.svg';
import MhFlagSvg from '@assets/svg/flag-mh.svg';
import MkFlagSvg from '@assets/svg/flag-mk.svg';
import MlFlagSvg from '@assets/svg/flag-ml.svg';
import MmFlagSvg from '@assets/svg/flag-mm.svg';
import MnFlagSvg from '@assets/svg/flag-mn.svg';
import MoFlagSvg from '@assets/svg/flag-mo.svg';
import MpFlagSvg from '@assets/svg/flag-mp.svg';
import MqFlagSvg from '@assets/svg/flag-mq.svg';
import MrFlagSvg from '@assets/svg/flag-mr.svg';
import MsFlagSvg from '@assets/svg/flag-ms.svg';
import MtFlagSvg from '@assets/svg/flag-mt.svg';
import MuFlagSvg from '@assets/svg/flag-mu.svg';
import MvFlagSvg from '@assets/svg/flag-mv.svg';
import MwFlagSvg from '@assets/svg/flag-mw.svg';
import MxFlagSvg from '@assets/svg/flag-mx.svg';
import MyFlagSvg from '@assets/svg/flag-my.svg';
import MzFlagSvg from '@assets/svg/flag-mz.svg';
import NaFlagSvg from '@assets/svg/flag-na.svg';
import NcFlagSvg from '@assets/svg/flag-nc.svg';
import NeFlagSvg from '@assets/svg/flag-ne.svg';
import NfFlagSvg from '@assets/svg/flag-nf.svg';
import NgFlagSvg from '@assets/svg/flag-ng.svg';
import NiFlagSvg from '@assets/svg/flag-ni.svg';
import NoFlagSvg from '@assets/svg/flag-no.svg';
import NpFlagSvg from '@assets/svg/flag-np.svg';
import NrFlagSvg from '@assets/svg/flag-nr.svg';
import NuFlagSvg from '@assets/svg/flag-nu.svg';
import NzFlagSvg from '@assets/svg/flag-nz.svg';
import OmFlagSvg from '@assets/svg/flag-om.svg';
import PaFlagSvg from '@assets/svg/flag-pa.svg';
import PeFlagSvg from '@assets/svg/flag-pe.svg';
import PfFlagSvg from '@assets/svg/flag-pf.svg';
import PgFlagSvg from '@assets/svg/flag-pg.svg';
import PhFlagSvg from '@assets/svg/flag-ph.svg';
import PkFlagSvg from '@assets/svg/flag-pk.svg';
import PlFlagSvg from '@assets/svg/flag-pl.svg';
import PmFlagSvg from '@assets/svg/flag-pm.svg';
import PnFlagSvg from '@assets/svg/flag-pn.svg';
import PsFlagSvg from '@assets/svg/flag-ps.svg';
import PtFlagSvg from '@assets/svg/flag-pt.svg';
import PwFlagSvg from '@assets/svg/flag-pw.svg';
import PyFlagSvg from '@assets/svg/flag-py.svg';
import QaFlagSvg from '@assets/svg/flag-qa.svg';
import ReFlagSvg from '@assets/svg/flag-re.svg';
import RoFlagSvg from '@assets/svg/flag-ro.svg';
import RsFlagSvg from '@assets/svg/flag-rs.svg';
import RuFlagSvg from '@assets/svg/flag-ru.svg';
import RwFlagSvg from '@assets/svg/flag-rw.svg';
import SaFlagSvg from '@assets/svg/flag-sa.svg';
import SbFlagSvg from '@assets/svg/flag-sb.svg';
import ScFlagSvg from '@assets/svg/flag-sc.svg';
import SdFlagSvg from '@assets/svg/flag-sd.svg';
import SeFlagSvg from '@assets/svg/flag-se.svg';
import SgFlagSvg from '@assets/svg/flag-sg.svg';
import ShFlagSvg from '@assets/svg/flag-sh.svg';
import SiFlagSvg from '@assets/svg/flag-si.svg';
import SjFlagSvg from '@assets/svg/flag-sj.svg';
import SkFlagSvg from '@assets/svg/flag-sk.svg';
import SlFlagSvg from '@assets/svg/flag-sl.svg';
import SmFlagSvg from '@assets/svg/flag-sm.svg';
import SnFlagSvg from '@assets/svg/flag-sn.svg';
import SoFlagSvg from '@assets/svg/flag-so.svg';
import SrFlagSvg from '@assets/svg/flag-sr.svg';
import SsFlagSvg from '@assets/svg/flag-ss.svg';
import StFlagSvg from '@assets/svg/flag-st.svg';
import SvFlagSvg from '@assets/svg/flag-sv.svg';
import SxFlagSvg from '@assets/svg/flag-sx.svg';
import SyFlagSvg from '@assets/svg/flag-sy.svg';
import SzFlagSvg from '@assets/svg/flag-sz.svg';
import TaFlagSvg from '@assets/svg/flag-ta.svg';
import TcFlagSvg from '@assets/svg/flag-tc.svg';
import TdFlagSvg from '@assets/svg/flag-td.svg';
import TfFlagSvg from '@assets/svg/flag-tf.svg';
import TgFlagSvg from '@assets/svg/flag-tg.svg';
import ThFlagSvg from '@assets/svg/flag-th.svg';
import TjFlagSvg from '@assets/svg/flag-tj.svg';
import TkFlagSvg from '@assets/svg/flag-tk.svg';
import TlFlagSvg from '@assets/svg/flag-tl.svg';
import TmFlagSvg from '@assets/svg/flag-tm.svg';
import TnFlagSvg from '@assets/svg/flag-tn.svg';
import ToFlagSvg from '@assets/svg/flag-to.svg';
import TrFlagSvg from '@assets/svg/flag-tr.svg';
import TtFlagSvg from '@assets/svg/flag-tt.svg';
import TvFlagSvg from '@assets/svg/flag-tv.svg';
import TwFlagSvg from '@assets/svg/flag-tw.svg';
import TzFlagSvg from '@assets/svg/flag-tz.svg';
import UaFlagSvg from '@assets/svg/flag-ua.svg';
import UgFlagSvg from '@assets/svg/flag-ug.svg';
import UmFlagSvg from '@assets/svg/flag-um.svg';
import UnFlagSvg from '@assets/svg/flag-un.svg';
import UsFlagSvg from '@assets/svg/flag-us.svg';
import UyFlagSvg from '@assets/svg/flag-uy.svg';
import UzFlagSvg from '@assets/svg/flag-uz.svg';
import VaFlagSvg from '@assets/svg/flag-va.svg';
import VcFlagSvg from '@assets/svg/flag-vc.svg';
import VeFlagSvg from '@assets/svg/flag-ve.svg';
import VgFlagSvg from '@assets/svg/flag-vg.svg';
import ViFlagSvg from '@assets/svg/flag-vi.svg';
import VnFlagSvg from '@assets/svg/flag-vn.svg';
import VnlFlagSvg from '@assets/svg/flag-vnl.svg';
import VprFlagSvg from '@assets/svg/flag-vpr.svg';
import VuFlagSvg from '@assets/svg/flag-vu.svg';
import WfFlagSvg from '@assets/svg/flag-wf.svg';
import WsFlagSvg from '@assets/svg/flag-ws.svg';
import XkFlagSvg from '@assets/svg/flag-xk.svg';
import XxFlagSvg from '@assets/svg/flag-xx.svg';
import YeFlagSvg from '@assets/svg/flag-ye.svg';
import YtFlagSvg from '@assets/svg/flag-yt.svg';
import ZaFlagSvg from '@assets/svg/flag-za.svg';
import ZmFlagSvg from '@assets/svg/flag-zm.svg';
import ZwFlagSvg from '@assets/svg/flag-zw.svg';

type Props = {
  className?: string;
  currency: GqlSupportedCurrency;
  style: object;
};

const BASE_CLASSES = ['inline-block'];

export const FlagIcon = memo(({ className, currency, style = {} }: Props) => {
  const classes = cn(className, BASE_CLASSES);

  const renderFlagSvg = () => {
    switch (currency) {
      case 'CAD':
        return <CaFlagSvg {...style} />;
      case 'JPY':
        return <JpFlagSvg {...style} />;
      case 'USD':
        return <UsFlagSvg {...style} />;
      case 'NZD':
        return <NzFlagSvg {...style} />;
      case 'GBP':
        return <GbFlagSvg {...style} />;
      case 'AUD':
        return <AuFlagSvg {...style} />;
      case 'EUR':
        return <EuFlagSvg {...style} />;
      case 'AED':
        return <AeFlagSvg {...style} />;
      case 'ARS':
        return <ArFlagSvg {...style} />;
      case 'BDT':
        return <BdFlagSvg {...style} />;
      case 'BGN':
        return <BgFlagSvg {...style} />;
      case 'BWP':
        return <BwFlagSvg {...style} />;
      case 'CFA':
        return <CfFlagSvg {...style} />;
      case 'CHF':
        return <ChFlagSvg {...style} />;
      case 'CLP':
        return <ClFlagSvg {...style} />;
      case 'CNH':
        return <CnFlagSvg {...style} />;
      case 'CNY':
        return <CnFlagSvg {...style} />;
      case 'CRC':
        return <CrFlagSvg {...style} />;
      case 'CZK':
        return <CzFlagSvg {...style} />;
      case 'DKK':
        return <DkFlagSvg {...style} />;
      case 'EGP':
        return <EgFlagSvg {...style} />;
      case 'GEL':
        return <GeFlagSvg {...style} />;
      case 'GHS':
        return <GhFlagSvg {...style} />;
      case 'HKD':
        return <HkFlagSvg {...style} />;
      case 'HRK':
        return <HrFlagSvg {...style} />;
      case 'HUF':
        return <HuFlagSvg {...style} />;
      case 'IDR':
        return <IdFlagSvg {...style} />;
      case 'ILS':
        return <IlFlagSvg {...style} />;
      case 'INR':
        return <InFlagSvg {...style} />;
      case 'KES':
        return <KeFlagSvg {...style} />;
      case 'KRW':
        return <KrFlagSvg {...style} />;
      case 'LKR':
        return <LkFlagSvg {...style} />;
      case 'MAD':
        return <MaFlagSvg {...style} />;
      case 'MXN':
        return <MxFlagSvg {...style} />;
      case 'MYR':
        return <MyFlagSvg {...style} />;
      case 'NGN':
        return <NgFlagSvg {...style} />;
      case 'NOK':
        return <NoFlagSvg {...style} />;
      case 'NPR':
        return <NpFlagSvg {...style} />;
      case 'PEN':
        return <PeFlagSvg {...style} />;
      case 'PHP':
        return <PhFlagSvg {...style} />;
      case 'PKR':
        return <PkFlagSvg {...style} />;
      case 'PLN':
        return <PlFlagSvg {...style} />;
      case 'RON':
        return <RoFlagSvg {...style} />;
      case 'RUB':
        return <RuFlagSvg {...style} />;
      case 'SEK':
        return <SeFlagSvg {...style} />;
      case 'SGD':
        return <SgFlagSvg {...style} />;
      case 'THB':
        return <ThFlagSvg {...style} />;
      case 'TRY':
        return <TrFlagSvg {...style} />;
      case 'TZS':
        return <TzFlagSvg {...style} />;
      case 'UAH':
        return <UaFlagSvg {...style} />;
      case 'UGX':
        return <UgFlagSvg {...style} />;
      case 'UYU':
        return <UyFlagSvg {...style} />;
      case 'VND':
        return <VnFlagSvg {...style} />;
      case 'ZAR':
        return <ZaFlagSvg {...style} />;
      case 'ZMW':
        return <ZwFlagSvg {...style} />;
    }
  };

  return (
    <div className={classes} data-testid={currency} style={{ width: '30px' }}>
      {renderFlagSvg()}
    </div>
  );
});
