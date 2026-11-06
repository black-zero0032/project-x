/* Hand-authored pixel sprites. Palette and silhouettes are original Project X assets. */
(function(root){
const palette={'.':null,g:'#47694b',G:'#74925b',d:'#273c31',b:'#735c42',B:'#a88c61',s:'#828b80',S:'#b4baa5',r:'#444e4c',w:'#e5e4cb',y:'#d4ad65',o:'#b86d43',R:'#aa5844',c:'#9eb9a2',k:'#25302c',f:'#c1c67c'};
const sprites={
 tree:['......g.........','.....ggG........','....gggGG.......','...dggggGG......','..ddgggggGG.....','....gggG........','..ddggggGG......','.dddgggggGG.....','...ddgggg.......','.....bb.........','.....bB.........','....bbbb........'],
 mountain:['.......s........','......sSs.......','.....ssSSs......','....srssSSs.....','...srrsssSSs....','..srrrssssSSs...','.srrrsssssssSs..','rrrrrrssssssssrr'],
 hut:['......bbb.......','.....bBBBb......','....bBBBBBb.....','...bbBBBBBBb....','..bbbBBBBBBBb...','.bbbbbbbbbbbb...','..BsssssssB.....','..BswwsrrsB.....','..BssssrrsB.....','..BssssrrsB.....','..bbbbbbbbB.....'],
 warehouse:['...rrrrrrrrrr...','..rssssssssssr..','.rssssssssssssr.','rrrrrrrrrrrrrrrr','.BssSssSssSssB..','.BssSssSssSssB..','.BssrrrrrrsssB..','.BssrBBBBBsssB..','.BssrBBBBBsssB..','.bbbbbbbbbbbbb..'],
 lab:['.....rr.........','.....ss.........','...rrrrrrrrr....','..rsssssssssr...','.rsssssssssssr..','rrrrrrrrrrrrrrr.','.BsswwsswwssB...','.BsswcsswcssB...','.BssssrrssssB...','.BssssrrssssB...','.bbbbbbbbbbbb...'],
 farm:['bbbbbbbbbbbbbbbb','bGGbGGbGGbGGbGGb','bgGbggbgGbgGbgGb','bbbbbbbbbbbbbbbb','bGGbGGbGGbGGbGGb','bggbgGbgGbgGbgGb','bbbbbbbbbbbbbbbb','bGGbGGbGGbGGbGGb','bggbggbgGbgGbgGb','bbbbbbbbbbbbbbbb'],
 furnace:['..........rr....','..........ss....','..........ss....','...rrrrrrrss....','..rsssssssss....','.rssssssssssr...','.rssSssSssssr...','.rssrrrrssssr...','.rsrryyrrsssr...','.rsryooyrsssr...','.rrrrrrrrrrrr...'],
 workshop:['.....BBBBBBB....','....bBBBBBBBb...','...bbBBBBBBBbb..','..bbbbbbbbbbbbb.','...BsSssssssB...','...BsswwssssB...','...BsswcssssB...','...BssssrrssB...','...BBBBBBBBBB...','..bbb..bB..bbb..'],
 tower:['....BBBBBBBB....','....ByByByBy....','....BBBBBBBB....','.....b....b.....','.....b....b.....','.....bbbbbb.....','.....bB..bb.....','.....b.Bb.b.....','.....b.bB.b.....','.....bb..Bb.....','....bbb..bbb....'],
 person:['....bbbb....','...bBBBBb...','...BwwwBB...','...BkwkwB...','....BBB.....','...rcccr....','..rrcccrr...','..BrcccrB...','...rrrrr....','...rr.rr....','...kk.kk....'],
 mutant:['...RR......R....','..RyyR...RR.....','.RRRRRRRRRR.....','RRRRdRRRRRRR....','..RdRRRRRdRRR...','..R...R...RR....','.RR..RR...R.....'],
 food:['......GG........','.....GGg........','....yyyyy.......','...yooyooy......','...yooooyy......','....yyyyy.......'],
 wood:['....bbbbbbb.....','...bBBBBBBbb....','...bBBBBBBbB....','...bBBBBBBbB....','....bbbbbbb.....'],
 stone:['......SSs.......','....Sssssss.....','...Ssssssssr....','...sssssssrr....','....rrrrrrr.....'],
 ore:['......ss........','....ssooss......','...ssooooos.....','...ssssosssr....','....rrrrrrr.....'],
 metal:['.....SSSSSS.....','....SwwwwwS.....','...SSSSSSSS.....','...sssssssS.....','....rrrrrr......'],
 tool:['......SSSS......','......sSSSS.....','.....BbSSS......','....Bb..........','...Bb...........','..Bb............'],
 spear:['........S.......','.......SS.......','......SS........','.....Bb.........','....Bb..........','...Bb...........','..Bb............'],
 road:['ssssssssssssssss','srrrrrrsrrrrrrrs','ssssssssssssssss','rrrsrrrrrrsrrrrr','ssssssssssssssss'],
 wall:['BBBBBBBBBBBBBBBB','ByBByBByBByBByBB','bbbbbbbbbbbbbbbb','BbbBbbBbbBbbBbbB','BbbBbbBbbBbbBbbB','bbbbbbbbbbbbbbbb']
};
function draw(ctx,type,x,y,size=32){const rows=sprites[type]||sprites.hut,scale=size/16;for(let j=0;j<rows.length;j++)for(let i=0;i<rows[j].length;i++){const color=palette[rows[j][i]];if(color){ctx.fillStyle=color;ctx.fillRect(Math.floor(x+i*scale),Math.floor(y+j*scale),Math.ceil(scale),Math.ceil(scale));}}}
const api={palette,sprites,draw};if(typeof module!=='undefined')module.exports=api;else root.Sprites=api;
})(typeof window!=='undefined'?window:globalThis);
