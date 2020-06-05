import { Component, OnInit, NgZone } from '@angular/core';
import { NavController, Events, PopoverController} from '@ionic/angular';
import { FeedService } from '../../../services/FeedService';
import { Router } from '@angular/router'
import { CommentComponent } from '../../../components/comment/comment.component'

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})


export class HomePage implements OnInit {
  private postList: any;

  constructor(
    private popoverController: PopoverController,
    private events: Events,
    private zone: NgZone,
    private feedService :FeedService,
    private router: Router) {
    this.postList = feedService.getPostList();
    console.log("101010101010101"+JSON.stringify(this.postList));
    this.events.subscribe('feeds:postDataUpdate',()=>{
      this.zone.run(() => {
        this.postList = this.feedService.getPostList();
        console.log("-----"+JSON.stringify(this.postList));
        // this.postList.push(post);
        // this.postList = list;
        // console.log("postList==>"+JSON.stringify(this.postList))
      });
    });
  }

  ionViewWillEnter() {
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

  getChannelOwnerName(nodeId, channelId){
    let ownerName:string = this.getChannel(nodeId, channelId).owner_name
    
    // if (ownerName.length >25){
    //   console.log("1111111111")
    //   return ownerName.slice(0,15)+"..."+ownerName.slice(ownerName.length-10,ownerName.length);
    // }
    //   console.log("222222222")
    // return ownerName;

    return this.feedService.indexText(ownerName,25,25);

  }

  ngOnInit() {
  }




  like(nodeId, channelId, postId){
    this.feedService.postLike(nodeId,Number(channelId),Number(postId),null);
  }
 
  comment(){
    // alert("TODO")
  }

  navTo(nodeId, channelId){
    this.router.navigate(['/feeds/tabs/home/channels', nodeId, channelId]);
  }

  navToPostDetail(nodeId, channelId, postId){
    this.router.navigate(['/feeds/tabs/home/postdetail',nodeId, channelId,postId]);
  }

  refresh(){
    // location.replace('/feeds/tabs/home');
    // location.replace('/feeds/tabs/home/channels');
  }

  async showCommentPage(event, nodeId, channelId, postId){
    const popover = await this.popoverController.create({
      component: CommentComponent,
      componentProps: {nodeId: nodeId, channelId: channelId, postId: postId},
      event:event,
      translucent: true,
      cssClass: 'bottom-sheet-popover'
    });

    popover.onDidDismiss().then((result)=>{
      if(result.data == undefined){
        return;
      }
    });
    return await popover.present();
  }

}
