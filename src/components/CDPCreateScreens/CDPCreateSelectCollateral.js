import React from 'react';
import {
  Box,
  Grid,
  Table,
  Radio,
  Overflow,
  Card
} from '@makerdao/ui-components-core';
import { TextBlock } from 'components/Typography';
import { connect } from 'react-redux';

import { prettifyNumber } from 'utils/ui';
import ilkList from 'references/ilkList';
import { getIlkData } from 'reducers/network/cdpTypes';

import useMaker from 'hooks/useMaker';
import lang from 'languages';
import ScreenFooter from './ScreenFooter';
import ScreenHeader from './ScreenHeader';

const CDPCreateSelectCollateralSidebar = () => (
  <Box px="l" py="m">
    <Box>
      {[
        [lang.stability_fee, lang.cdp_create.stability_fee_description],
        [lang.liquidation_ratio, lang.cdp_create.liquidation_ratio_description],
        [
          lang.liquidation_penalty,
          lang.cdp_create.liquidation_penalty_description
        ]
      ].map(([title, text]) => (
        <Grid mb="m" key={title} gridRowGap="xs">
          <TextBlock t="h5" lineHeight="normal">
            {title}
          </TextBlock>
          <TextBlock t="body">{text}</TextBlock>
        </Grid>
      ))}
    </Box>
  </Box>
);

function IlkTableRowView({ ilk, checked, dispatch }) {
  const { maker } = useMaker();
  const [userGemBalance, setUserGemBalance] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      setUserGemBalance(await maker.getToken(ilk.currency).balance());
    })();
  }, []);

  return (
    <tr css="white-space: nowrap;">
      <td>
        <Radio
          checked={checked}
          onClick={() =>
            checked
              ? dispatch({
                  type: 'reset-ilk'
                })
              : dispatch({
                  type: 'set-ilk',
                  payload: {
                    key: ilk.key,
                    gemBalance: userGemBalance.toNumber(),
                    currency: ilk.currency,
                    data: ilk.data
                  }
                })
          }
          mr="xs"
        />
      </td>
      <td>{ilk.symbol}</td>
      <td>{ilk.data.rate} %</td>
      <td>{ilk.data.liquidationRatio} %</td>
      <td>{ilk.data.liquidationPenalty} %</td>
      <td css="text-align: right">{prettifyNumber(userGemBalance)}</td>
    </tr>
  );
}

function mapStateToProps(state, { ilk }) {
  return {
    ilk: {
      ...ilk,
      data: getIlkData(state, ilk.key)
    }
  };
}

const IlkTableRow = connect(
  mapStateToProps,
  {}
)(IlkTableRowView);

const CDPCreateSelectCollateral = ({ selectedIlk, dispatch }) => {
  return (
    <Box
      maxWidth="1040px"
      css={`
        margin: 0 auto;
      `}
    >
      <ScreenHeader
        title={lang.cdp_create.select_title}
        text={lang.cdp_create.select_text}
      />
      <Grid
        gridTemplateColumns={{ s: 'minmax(0, 1fr)', l: '2fr 1fr' }}
        gridGap="m"
        my="l"
      >
        <Card px="l" py="m">
          <Overflow x="scroll" y="visible">
            <Table
              width="100%"
              css={`
                th,
                td {
                  padding-right: 10px;
                }
              `}
            >
              <thead>
                <tr css="white-space: nowrap;">
                  <th />
                  <th>{lang.collateral_type}</th>
                  <th>{lang.stability_fee}</th>
                  <th>{lang.liquidation_ratio_shortened}</th>
                  <th>{lang.liquidation_penalty_shortened}</th>
                  <th css="text-align: right">{lang.your_balance}</th>
                </tr>
              </thead>
              <tbody>
                {ilkList.map(ilk => (
                  <IlkTableRow
                    key={ilk.key}
                    checked={ilk.key === selectedIlk.key}
                    dispatch={dispatch}
                    ilk={ilk}
                  />
                ))}
              </tbody>
            </Table>
          </Overflow>
        </Card>
        <Card>
          <CDPCreateSelectCollateralSidebar />
        </Card>
      </Grid>
      <ScreenFooter
        dispatch={dispatch}
        canGoBack={false}
        canProgress={!!selectedIlk.key}
      />
    </Box>
  );
};
export default CDPCreateSelectCollateral;
