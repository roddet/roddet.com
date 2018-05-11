import { Component, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { Context } from '../../prismic/context';
import { PrismicService } from '../../prismic/prismic.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import PrismicDOM from 'prismic-dom';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})
export class PageComponent implements OnInit, OnDestroy {
  private routeStream: Subscription;
  PrismicDOM: Object = PrismicDOM;

  ctx ?: Context;
  pageContent ?: any;
  toolbar ?: boolean = false;

  constructor(private prismic: PrismicService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.routeStream = this.route.params
      .map(params => params['uid'])
      .flatMap(uid => Observable.fromPromise(this.prismic.buildContext()).map(ctx => [uid, ctx]))
      .subscribe(([uid, ctx]) => {
        this.ctx = ctx;
        this.fetchPage(uid);
      });
  }

  ngOnDestroy() {
    this.routeStream.unsubscribe();
  }

  ngAfterViewChecked() {
    if(this.ctx && !this.toolbar) {
      this.prismic.toolbar(this.ctx.api);
      this.toolbar = true;
    }
  }

  fetchPage(pageUID) {
    this.ctx.api.getByUID('blog', pageUID, {})
      .then(data => {
        this.toolbar = false;
        this.pageContent = data;
      })
      .catch(e => console.log(e));
  }
}
