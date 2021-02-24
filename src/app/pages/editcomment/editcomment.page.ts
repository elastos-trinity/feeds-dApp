import { Component, OnInit, NgZone } from '@angular/core';
import { NavController, Events } from '@ionic/angular';
import { FeedService } from 'src/app/services/FeedService';
import { ActivatedRoute } from '@angular/router';
import { NativeService } from '../../services/NativeService';
import { ThemeService } from '../../services/theme.service';
import { TranslateService } from "@ngx-translate/core";
import * as _ from 'lodash';
declare let titleBarManager: TitleBarPlugin.TitleBarManager;
@Component({
  selector: 'app-editcomment',
  templateUrl: './editcomment.page.html',
  styleUrls: ['./editcomment.page.scss'],
})
export class EditCommentPage implements OnInit {
  public connectionStatus = 1;
  public nodeStatus:any={};
  public channelAvatar = "";
  public channelName = "";
  public subscribers:string = "";
  public newComment: string="";
  public oldNewComment: string="";
  public nodeId: string ="";
  public channelId: number= 0;
  public postId: number = 0;
  public commentById:Number = 0;
  public commentId:Number = 0;
  public imgUrl: string = "";

  constructor(
    private events: Events,
    private native: NativeService,
    private acRoute: ActivatedRoute,
    private navCtrl: NavController,
    private zone: NgZone,
    private feedService: FeedService,
    public theme:ThemeService,
    private translate:TranslateService) { }

  ngOnInit() {
    this.acRoute.queryParams.subscribe((data)=>{
      let item = _.cloneDeep(data);
      this.nodeId = item.nodeId;
      this.channelId = item.channelId;
      this.postId = item.postId;
      this.commentById = item.commentById;
      this.commentId = item.commentId;
      let content = item.content || "";
      this.getContent(content);
    });
  }

  ionViewWillEnter() {
    this.initTitle();
    this.native.setTitleBarBackKeyShown(true);

    this.connectionStatus = this.feedService.getConnectionStatus();
    let channel = this.feedService.getChannelFromId(this.nodeId,this.channelId) || {};
    this.channelName = channel["name"] || "";
    this.subscribers = channel["subscribers"] || "";
    this.channelAvatar = this.feedService.parseChannelAvatar(channel["avatar"]) || "";


    this.events.subscribe(FeedsEvent.PublishType.connectionChanged,(status)=>{
      this.zone.run(() => {
        this.connectionStatus = status;
      });
    });

    this.events.subscribe(FeedsEvent.PublishType.updateTitle,()=>{
      this.initTitle();
    });

    this.events.subscribe(FeedsEvent.PublishType.rpcRequestError, () => {
      this.zone.run(() => {
        this.native.hideLoading();
      });
    });

    this.events.subscribe(FeedsEvent.PublishType.rpcResponseError, () => {
      this.zone.run(() => {
        this.native.hideLoading();
      });
    });

    this.events.subscribe(FeedsEvent.PublishType.editCommentFinish, () => {
      this.zone.run(() => {
        this.navCtrl.pop().then(()=>{
          this.native.hideLoading();
        });
      });
    });

    this.events.subscribe(FeedsEvent.PublishType.friendConnectionChanged, (nodeId, status)=>{
      this.zone.run(()=>{
        this.nodeStatus[nodeId] = status;
      });
    });

    this.initnodeStatus();
  }

  ionViewDidEnter(){
  }

  ionViewWillLeave(){
    this.events.unsubscribe(FeedsEvent.PublishType.connectionChanged);
    this.events.unsubscribe(FeedsEvent.PublishType.updateTitle);
    this.events.unsubscribe(FeedsEvent.PublishType.rpcRequestError);
    this.events.unsubscribe(FeedsEvent.PublishType.rpcResponseError);
    this.events.unsubscribe(FeedsEvent.PublishType.editCommentFinish);
    this.events.unsubscribe(FeedsEvent.PublishType.friendConnectionChanged);
  }

  initTitle(){
    titleBarManager.setTitle(this.translate.instant("EditCommentPage.title"));
  }

  publishComment(){

    if (this.feedService.getServerStatusFromId(this.nodeId) != 0){
      this.native.toast_trans("common.connectionError");
      return;
    }

    if(this.checkServerStatus(this.nodeId) != 0){
      this.native.toastWarn('common.connectionError1');
      return;
    }

    let newComment = this.native.iGetInnerText(this.newComment) || "";
    if(newComment===""){
      this.native.toast_trans('CommentPage.inputComment');
      return false;
    }

    if(this.newComment === this.oldNewComment){
      this.native.toast_trans("EditCommentPage.notModifiedYet");
      return false;
    }

    this.native.showLoading("common.waitMoment").then(()=>{
      this.editComment();
    }).catch(()=>{
      this.native.hideLoading();
    });
  }

  private editComment(){
    this.feedService.editComment(this.nodeId,Number(this.channelId),Number(this.postId),Number(this.commentId),Number(this.commentById),this.newComment);
  }

  checkServerStatus(nodeId: string){
    return this.feedService.getServerStatusFromId(nodeId);
  }

  initnodeStatus(){
    let status = this.checkServerStatus(this.nodeId);
    this.nodeStatus[this.nodeId] = status;
  }

  pressName(channelName:string){
    this.native.createTip(channelName);
  }

  getContent(content:string){
    this.newComment = content;
    this.oldNewComment = content;
  }

  addImg() {
    this.native.toast("common.comingSoon");
  }

  showBigImage(content: any){
    this.native.openViewer(content,"common.image","CreatenewpostPage.addingPost");
  }
}
