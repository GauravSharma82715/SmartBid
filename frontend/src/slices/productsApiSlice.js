import { PRODUCTS_URL, UPLOAD_URL } from '../constants';
import { apiSlice } from './apiSlice';

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getProducts: builder.query({
      query: ({ limit, skip, search, category, status, sort } = {}) => ({
        url: PRODUCTS_URL,
        params: { limit, skip, search, category, status, sort }
      }),
      providesTags: ['Product']
    }),
    getTopProducts: builder.query({
      query: () => ({
        url: `${PRODUCTS_URL}/top`
      }),
      providesTags: ['Product']
    }),
    getProductDetails: builder.query({
      query: productId => ({
        url: `${PRODUCTS_URL}/${productId}`
      }),
      providesTags: ['Product']
    }),
    createProduct: builder.mutation({
      query: productData => ({
        url: PRODUCTS_URL,
        method: 'POST',
        body: productData
      }),
      invalidatesTags: ['Product']
    }),
    updateProduct: builder.mutation({
      query: ({ productId, ...productData }) => ({
        url: `${PRODUCTS_URL}/${productId}`,
        method: 'PUT',
        body: { ...productData }
      }),
      invalidatesTags: ['Product']
    }),
    deleteProduct: builder.mutation({
      query: productId => ({
        url: `${PRODUCTS_URL}/${productId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Product']
    }),
    placeBid: builder.mutation({
      query: ({ productId, amount }) => ({
        url: `${PRODUCTS_URL}/${productId}/bid`,
        method: 'POST',
        body: { amount }
      }),
      invalidatesTags: ['Product']
    }),
    closeAuction: builder.mutation({
      query: productId => ({
        url: `${PRODUCTS_URL}/${productId}/close`,
        method: 'POST'
      }),
      invalidatesTags: ['Product']
    }),
    getSellerAuctions: builder.query({
      query: () => ({
        url: `${PRODUCTS_URL}/seller/my-auctions`
      }),
      providesTags: ['Product']
    }),
    getSellerAnalytics: builder.query({
      query: () => ({
        url: `${PRODUCTS_URL}/seller/analytics`
      }),
      providesTags: ['Product']
    }),
    getBuyerBids: builder.query({
      query: () => ({
        url: `${PRODUCTS_URL}/buyer/my-bids`
      }),
      providesTags: ['Product']
    }),
    uploadProductImage: builder.mutation({
      query: data => ({
        url: UPLOAD_URL,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Product']
    }),
    createProductReview: builder.mutation({
      query: ({ productId, ...reviewData }) => ({
        url: `${PRODUCTS_URL}/reviews/${productId}`,
        method: 'POST',
        body: { ...reviewData }
      }),
      invalidatesTags: ['Product']
    })
  })
});

export const {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useCreateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
  useUpdateProductMutation,
  useCreateProductReviewMutation,
  useGetTopProductsQuery,
  usePlaceBidMutation,
  useCloseAuctionMutation,
  useGetSellerAuctionsQuery,
  useGetSellerAnalyticsQuery,
  useGetBuyerBidsQuery
} = productApiSlice;
