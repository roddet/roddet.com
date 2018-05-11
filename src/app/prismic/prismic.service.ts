import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import Prismic from 'prismic-javascript';

import { Context } from './context';
import { Preview } from './preview';
import { CONFIG } from '../../prismic-configuration';

@Injectable()
export class PrismicService {

  constructor(private http: HttpClient) {}

  buildContext() {
    const options = {};
    return Prismic.api(CONFIG.apiEndpoint, {accessToken: CONFIG.accessToken})
      .then((api) => {
        return {
          api,
          endpoint: CONFIG.apiEndpoint,
          accessToken: CONFIG.accessToken,
          linkResolver: CONFIG.linkResolver,
          toolbar: this.toolbar,
        } as Context;
      })
      .catch(e => console.log(`Error during connection to your Prismic API: ${e}`));
  }

  validateOnboarding() {
    const infos = this.getRepositoryInfos();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    if(infos.isConfigured) {
      this.http.post(`${infos.repoURL}/app/settings/onboarding/run`, null, {headers: headers})
      .subscribe(
        null,
        (err) => console.log(`Cannot access your repository, check your api endpoint: ${err}`)
      );
    }
  }

  getRepositoryInfos() {
    const repoRegexp = /^(https?:\/\/([-\w]+)\.[a-z]+\.(io|dev))\/api(\/v2)?$/;
    const [_, repoURL, name] = CONFIG.apiEndpoint.match(repoRegexp);
    const isConfigured = name !== 'your-repo-name';
    return { repoURL, name, isConfigured };
  }

  toolbar(api) {
    const maybeCurrentExperiment = api.currentExperiment();
    if (maybeCurrentExperiment) {
      window['PrismicToolbar'].startExperiment(maybeCurrentExperiment.googleId());
    }
    window['PrismicToolbar'].setup(CONFIG.apiEndpoint);
  }

  preview(token) {
    return this.buildContext()
    .then(ctx => {
      return ctx.api.previewSession(token, ctx.linkResolver, '/').then((url) => {
        return {
          cookieName: Prismic.previewCookie,
          token: token,
          redirectURL: url
        } as Preview;
      });
    });
  }
}
