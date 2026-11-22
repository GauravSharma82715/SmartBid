import React from 'react';
import { Helmet } from 'react-helmet-async';

const Meta = ({ title, description, keywords }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
    </Helmet>
  );
};

Meta.defaultProps = {
  title: 'SmartBid | Real-Time Online Auction & Smart Bidding Platform',
  description:
    'SmartBid is a real-time online auction marketplace where sellers list unique products and buyers participate in live bidding with instant WebSocket updates and transparent countdowns.',
  keywords:
    'online auction, live bidding, smartbid, real-time auctions, websocket bidding, marketplace'
};

export default Meta;
