import { Component, OnInit ,Input,Output,EventEmitter} from '@angular/core';
import { FeedService } from 'src/app/services/FeedService';
import { NativeService } from 'src/app/services/NativeService';
import { ThemeService } from 'src/app/services/theme.service';
import { UtilService } from 'src/app/services/utilService';
import { PopupProvider } from 'src/app/services/popup';
import { ViewHelper } from 'src/app/services/viewhelper.service';

@Component({
  selector: 'app-myfeeds',
  templateUrl: './myfeeds.component.html',
  styleUrls: ['./myfeeds.component.scss'],
})
export class MyfeedsComponent implements OnInit {
  @Output() fromChild=new EventEmitter();
  @Input() channels:any = [];
  @Input() nodeStatus:any = {};
  @Output () toFeedPage = new EventEmitter();
  public popover:any = "";
  constructor(
    private feedService: FeedService,
    public theme:ThemeService,
    private native:NativeService,
    public popupProvider:PopupProvider,
    private viewHelper: ViewHelper) {

  }

  ngOnInit() {

  }

  moreName(name:string){
   return UtilService.moreNanme(name);
  }

  createNewFeed(){
    this.checkDid();
  }


  navTo(nodeId:string, channelId:number){
    this.toFeedPage.emit({"nodeId":nodeId,"channelId":channelId,"page":"/channels"});
    //this.native.getNavCtrl().navigateForward(['/channels', nodeId, channelId]);
  }


  parseAvatar(avatar: string): string{
    return this.feedService.parseChannelAvatar(avatar);
  }

  menuMore(nodeId: string , channelId: number, channelName: string){
    this.fromChild.emit({"nodeId":nodeId,"channelId":channelId,"channelName":channelName,"postId":0,"tabType":"myfeeds"});
  }

  handleClientNumber(nodeId){
    return this.feedService.getServerStatisticsNumber(nodeId);
  }

  pressName(channelName:string){
    let name =channelName || "";
    if(name != "" && name.length>15){
      this.viewHelper.createTip(name);
    }
  }

  checkDid(){
      this.feedService.setProfileIamge("assets/images/profile-1.svg");
      this.feedService.setSelsectIndex(1);
      if(this.feedService.getConnectionStatus() != 0){
        this.native.toastWarn('common.connectionError');
        return;
      }

      let bindServer = this.feedService.getBindingServer();

      if (bindServer != null && bindServer != undefined){
        if(this.feedService.getConnectionStatus() != 0){
          this.native.toastWarn('common.connectionError');
          return;
        }

        if (!this.feedService.checkBindingServerVersion(()=>{
          this.feedService.hideAlertPopover();
        })) return;

        this.native.navigateForward(['/createnewfeed'],"");
      }else{
        this.native.getNavCtrl().navigateForward(['/bindservice/scanqrcode']);
      }
  }
}

