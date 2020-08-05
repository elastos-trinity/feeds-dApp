import { Component, OnInit, NgZone } from '@angular/core';
import { Events,IonTabs} from '@ionic/angular';
import { FeedService } from 'src/app/services/FeedService';
import { MenuService } from 'src/app/services/MenuService';
import { FeedsPage } from '../feeds.page'
import { ThemeService } from 'src/app/services/theme.service';
import { UtilService } from 'src/app/services/utilService';
import { TranslateService } from "@ngx-translate/core";
import { NativeService } from 'src/app/services/NativeService';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})


export class HomePage implements OnInit {
  private postList: any = [];
  public nodeStatus:any={};
  constructor(
    private feedspage: FeedsPage,
    private tabs: IonTabs,
    private events: Events,
    private zone: NgZone,
    private feedService :FeedService,
    public theme:ThemeService,
    private translate:TranslateService,
    private navtive:NativeService,
    private menuService: MenuService) {

     
     
  }

  ionViewWillEnter() {
    this.events.subscribe('feeds:refreshPage',()=>{
      this.zone.run(() => {
        this.postList = this.feedService.getPostList();
        this.initnodeStatus();
      });
    });
      

    this.events.subscribe('feeds:postDataUpdate',()=>{
      this.zone.run(() => {
        this.postList = this.feedService.getPostList();
        this.initnodeStatus();
      });
    });

    this.events.subscribe("feeds:friendConnectionChanged", (nodeId, status)=>{
              this.zone.run(()=>{
                this.nodeStatus[nodeId] = status;
              });
    });
  }


 ionViewWillLeave(){
    this.events.unsubscribe("feeds:postDataUpdate");
    this.events.unsubscribe("feeds:refreshPage");
    this.events.unsubscribe("feeds:friendConnectionChanged");
  }

  getChannel(nodeId, channelId):any{
    return this.feedService.getChannelFromId(nodeId,channelId);
  }

  getContentText(content: string): string{
    return this.feedService.parsePostContentText(content);
  }

  getContentImg(content: any): string{
    return this.feedService.parsePostContentImg(content);
  }

  getChannelOwnerName(nodeId, channelId): string{
    let channel = this.getChannel(nodeId, channelId);
    if (channel == null || channel == undefined){
      return "";
    }

    let owner: string = channel.owner_name;
    if (owner.length>25){
      return this.feedService.indexText(owner,25,25);
    }
    else{
      return owner;
    }
  }

  ngOnInit() {
    this.postList = this.feedService.getPostList();
    this.initnodeStatus();
  }

  like(nodeId, channelId, postId){
    if (this.checkMyLike(nodeId,channelId,postId)){
      this.feedService.postUnlike(nodeId,Number(channelId),Number(postId),0);
      return ;
    }

    this.feedService.postLike(nodeId,Number(channelId),Number(postId),0);
  }

  navTo(nodeId, channelId){
    this.navtive.getNavCtrl().navigateForward(['/channels', nodeId, channelId]);
  }

  navToPostDetail(nodeId, channelId, postId){
    this.navtive.getNavCtrl().navigateForward(['/postdetail',nodeId, channelId,postId]);
  }

  refresh(){
  }

  showCommentPage(nodeId, channelId, postId){
    this.navtive.navigateForward(["comment",nodeId,channelId,postId],"");
  }

  checkMyLike(nodeId: string, channelId: number, postId: number){
    return this.feedService.checkMyLike(nodeId, channelId, postId);
  }

  exploreFeeds(){
    this.tabs.select("search");
    this.feedspage.search();
  }

  parseAvatar(nodeId: string, channelId: number): string{
    let channel = this.getChannel(nodeId, channelId);
    if (channel == null || channel == undefined)
      return "";
    return this.feedService.parseChannelAvatar(channel.avatar);
  }

  handleDisplayTime(createTime:number){

    let obj = UtilService.handleDisplayTime(createTime);
    if(obj.type === 's'){
       return this.translate.instant('common.just');
    }
    if(obj.type==='m'){
      return obj.content+this.translate.instant('HomePage.minutesAgo');
    }
    if(obj.type==='h'){
      return obj.content+this.translate.instant('HomePage.hoursAgo');
    }

    if(obj.type === 'yesterday'){
      return this.translate.instant('common.yesterday');
    }
    return  obj.content;
  }

  menuMore(nodeId: string , channelId: number){
    let channel = this.getChannel(nodeId, channelId);
    if (channel == null || channel == undefined)
      return ;
    let channelName = channel.name;
    this.menuService.showChannelMenu(nodeId, channelId, channelName);
  }

  getChannelName(nodeId: string, channelId: number): string{
    let channel = this.getChannel(nodeId, channelId);
    if (channel == null || channel == undefined)
      return "";
    return channel.name;
  }

  checkServerStatus(nodeId: string){
    return this.feedService.getServerStatusFromId(nodeId);
  }

  initnodeStatus(){
     for(let index =0 ;index<this.postList.length;index++){
            let nodeId = this.postList[index]['nodeId'];
            let status = this.checkServerStatus(nodeId);
            this.nodeStatus[nodeId] = status;
     }
  }
}
