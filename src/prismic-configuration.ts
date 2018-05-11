import { Injectable } from '@angular/core';

export interface PrismicConfiguration {
  apiEndpoint: string;
  accessToken?: string;
  linkResolver: Function;
};

export const CONFIG: PrismicConfiguration = {
  apiEndpoint: 'https://roddet.prismic.io/api/v2',
  linkResolver(doc) {
    return '/';
  }
};
