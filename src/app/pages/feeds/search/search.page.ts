import { Component, OnInit, NgZone} from '@angular/core';
import { FeedService } from 'src/app/services/FeedService';
import { Events } from '@ionic/angular';
import { NativeService } from 'src/app/services/NativeService';
import { ThemeService } from 'src/app/services/theme.service';
import { MenuService } from 'src/app/services/MenuService';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  public nodeStatus:any={};
  private channelList= [];
  constructor(
    private feedService: FeedService,
    private events: Events,
    private zone: NgZone,
    private native: NativeService,
    public theme:ThemeService,
    private menuService: MenuService) {
     
    }

  ngOnInit() {
    this.channelList = this.feedService.refreshLocalChannels();
    this.initnodeStatus();
  }

  initData(){
    
    this.events.subscribe("feeds:friendConnectionChanged", (nodeId, status)=>{
      this.zone.run(()=>{
        this.nodeStatus[nodeId] = status;
      });
    });

    this.events.subscribe('feeds:subscribeFinish', (nodeId, channelId, name)=> {
      // this.native.toast(name + " subscribed");
      this.zone.run(() => {
        this.channelList = this.feedService.refreshLocalChannels();
        this.initnodeStatus();
      });
    });

    this.events.subscribe('feeds:unsubscribeFinish', (nodeId, channelId, name) => {
      // this.native.toast(name + " unsubscribed");
      this.zone.run(() => {
        this.channelList = this.feedService.refreshLocalChannels();
        this.initnodeStatus();
      });
    });

    this.events.subscribe('feeds:refreshChannels', list =>{
      this.channelList = list;
      this.initnodeStatus();
    });

    this.events.subscribe('feeds:channelsDataUpdate', () =>{
      this.channelList = this.feedService.getChannelsList();
      this.initnodeStatus();
    });
  }

  removeSubscribe(){
    this.events.unsubscribe('feeds:friendConnectionChanged');
    this.events.unsubscribe('feeds:subscribeFinish');
    this.events.unsubscribe('feeds:unsubscribeFinish');
    this.events.unsubscribe('feeds:refreshChannels');
    this.events.unsubscribe('feeds:channelsDataUpdate');
  }

  ionViewWillEnter() {
       this.initData();
  }

  ionViewWillLeave(){
       this.removeSubscribe();
  }

  subscribe(nodeId: string, id: number){
    this.feedService.subscribeChannel(nodeId, id);
  }

  async unsubscribe(nodeId: string, name: string, id: number){
    this.menuService.showUnsubscribeMenu(nodeId, id, name);
  }

  getItems(events){
    if(events.target.value == ""){
      this.channelList = this.feedService.refreshLocalChannels();
    }
    this.channelList = this.channelList.filter(
      channel=>channel.name.toLowerCase().indexOf(events.target.value.toLowerCase()) > -1
      );
  }

  doRefresh(event) {
    this.feedService.refreshChannels();
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  loadData(event) {
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  navTo(nodeId, channelId){
    this.native.navigateForward(['/channels', nodeId, channelId],"");
  }

  parseChannelAvatar(avatar: string): string{
    return this.feedService.parseChannelAvatar(avatar);
  }

  addfeedssource(){
    this.native.navigateForward(['/menu/servers'],"");
  }

  checkServerStatus(nodeId: string){
    return this.feedService.getServerStatusFromId(nodeId);
  }

  initnodeStatus(){
    for(let index =0 ;index<this.channelList.length;index++){
           let nodeId = this.channelList[index]['nodeId'];
           let status = this.checkServerStatus(nodeId);
           this.nodeStatus[nodeId] = status;
    }
 }

}