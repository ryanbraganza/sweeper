/*global $ */
/* TODO 
	6. app engine
	7. facebook
	8. drag-clicks
	9. facebook++
*/
var debug = false;

var Sweeper = {};

var time = 40;
var opened = 0;

function updateTimeText(s)
{
	$('#timer').html(s);
}
var timer;
function startTimer()
{
	if (timer){return;}
	updateTimeText(time);
	timer = setInterval(function()
	{
		if (time>0)
		{
			time -= 1;
			updateTimeText(time);
		}
	}, 1000);
}	
function resetTimer()
{
	clearTimeout(timer);
	timer = null;
	time = 40;
	updateTimeText(time);

}
var imgs = {'open': 'open.png', 'flag': 'flag.png', 'mine': 'mine.png', 1:'1.png', 2:'2.png', 3:'3.png',
		4:'4.png', 5:'5.png', 6:'6.png', 7:'7.png', 8:'8.png', 'closed':'closed.png'};
var board = [];

function initMines(numMines)
{
	Sweeper.numMines = numMines;
	Sweeper.numBoardSquares = board.length*board[0].length;
	if (Sweeper.numMines > Sweeper.numBoardSquares)
	{
		alert ('too many mines');
	}
	var whichMine;
	for(var i=0; i<board.length; i++)
	{
		for(var j=0; j<board.length;j++)
		{
			board[i][j].mine = false;
		}
	}
	var numPlaced = 0;
	while (numPlaced < numMines)
	{
		whichMine = Math.floor((Sweeper.numBoardSquares-numPlaced)*Math.random());
		var k=-1;
		var placed=false;
		for(var m=0;m<board.length;m++){
		for(var n=0;n<board[m].length;n++)
		{
			if (!board[m][n].mine)
			{
				k++;
			}
			if (k === whichMine && !placed)
			{
				board[m][n].mine = true;
				placed = true;
			}
		}}
		if (!placed){alert('die');}
		numPlaced++;
	}
}

function show(matrix)
{
	var it = '';
	for(var i=0; i<matrix.length;i++)
	{
		for (var j=0; j<matrix[i].length; j++)
		{
			it+=matrix[i][j];
		}
		it+='\n';
	}
	return it;
}

function neighbours(i, j)
{
	i = parseInt(i, 10);
	j = parseInt(j, 10);
	function inBoard(a, b)
	{
		if (a<0){return false;}
		if (a>=board.length){return false;}
		if (b<0){return false;}
		if (b>=board[a].length){return false;}
		return true;
	}
	var it = [];
	if(inBoard(i-1,j-1)){it.push({x:i-1,y:j-1});}
	if(inBoard(i-1,j)){it.push({x:i-1,y:j});}
	if(inBoard(i-1,j+1)){it.push({x:i-1,y:j+1});}
	if(inBoard(i,j-1)){it.push({x:i,y:j-1});}
	if(inBoard(i,j+1)){it.push({x:i,y:j+1});}
	if(inBoard(i+1,j-1)){it.push({x:i+1,y:j-1});}
	if(inBoard(i+1,j)){it.push({x:i+1,y:j});}
	if(inBoard(i+1,j+1)){it.push({x:i+1,y:j+1});}
	
	return it;
}

function log(msg){
	if (!debug){return;}
	function ab(){
	
		var it='';
		for(var i=0; i<board.length;i++){
			for(var j=0; j<board[i].length;j++)
			{
				it+=board[i][j].mine;
				it+=board[i][j].state;
			}
			it+='\n';
		}
		return it;
	}
	if (msg){$('#log').html(ab() + '<br />' + msg);
	}else{	$('#log').html(ab());}
}
function flag(it)
{
	var x = it.attr('id').split('y')[0];
	var y = it.attr('id').split('y')[1];
	if (board[x][y].state == 'closed')
	{
		board[x][y].state = 'flag';
		it.attr('src', imgs.flag);
	} else if (board[x][y].state == 'flag')
	{
		board[x][y].state = 'closed';
		it.attr('src', imgs.closed);
	}
}
function openMulti(it)
{
	var x = it.attr('id').split('y')[0];
	var y = it.attr('id').split('y')[1];

	if (board[x][y].state === 'open')
	{
		var neighbs = neighbours(x, y);
		var numFlags = 0;
		var numMines = 0;
		for (var i=0; i < neighbs.length; i++)
		{
			if (board[neighbs[i].x][neighbs[i].y].mine){numMines++;}
			if (board[neighbs[i].x][neighbs[i].y].state == 'flag'){numFlags++;}
		}
		if (numMines == numFlags)
		{
			for (var m = 0; m < neighbs.length; m++)
			{
				if (board[neighbs[m].x][neighbs[m].y].state == 'closed')
				{
	var selector = '#' + neighbs[m].x + 'y' + neighbs[m].y;
					open($(selector));
				}
			}
		}
	}
}
function win()
{
	clearTimeout(timer);
	alert('win with ' + time + ' secs remaining');
	$('#reset').show('slow');
	$('#board img').add('#startStop').add('#stopClear').unbind();
}
function gameOver()
{
	clearTimeout(timer);
	alert('lose');
	$('#reset').show('slow');
	$('#board img').add('#startStop').add('#stopClear').unbind();
}

function open(it)
{
	var x = it.attr('id').split('y')[0];
	var y = it.attr('id').split('y')[1];
	startTimer();
	board[x][y].state ='open';
	if (board[x][y].mine){
		it.attr('src', imgs.mine);
		gameOver();
	} else{
		opened += 1;
		var neighbs = neighbours(x, y);
		var numMines = 0;
		for (var i=0; i < neighbs.length; i++){
			if(board[neighbs[i].x][neighbs[i].y].mine){
				numMines++;
			}
		}
		if (numMines>0){
			it.attr('src', imgs[numMines]);
		} else {
			it.attr('src', imgs.open);
			for (var j=0; j < neighbs.length; j++){
				if(!board[neighbs[j].x][neighbs[j].y].mine){
				var selector='#'+neighbs[j].x+'y'+neighbs[j].y;
			if (board[neighbs[j].x][neighbs[j].y].state != 'open'){
					open($(selector));}
				}
			}
		}
	}
	if (opened == Sweeper.numBoardSquares - Sweeper.numMines)
	{
		win();
	}
	log('opening: ' + x + ',' + y);
}

function content(dimensions){
	var width = dimensions.width;
	var height = dimensions.height;
	var it='';
	board = [];
	for (var i=0; i < width; i++)
	{
		board[i] = [];
		for (var j=0;j<height;j++)
		{
			board[i][j] = {};
			it+='<img src='+imgs.closed+' id="'+i+'y'+j+'">';
			board[i][j].state='closed';
		}
		it+='<br>';
	}
	return it;
}



var leftDown = false;
var rightDown = false;
var done = false;

Sweeper.init = function(dimensions){
	if (dimensions){Sweeper.dimensions = dimensions;}
	dimensions = dimensions ? dimensions : Sweeper.dimensions;
	$('#reset').hide();
	if (!done)
	{
		done = true;
		$('#reset').click(
			function(evt){
				resetTimer();
				opened = 0;
				Sweeper.init();
			}
		);
		$('body').mouseleave(function(evt){
			// reset
			leftDown=false; rightDown=false;
		});
		$("body").mouseup(function(evt){
				if (evt.which==1){leftDown=false;}
				if (evt.which==3){rightDown=false;}
			});
		$('#reset').attr('value','reset');
	}

	$("#board").html(content(dimensions));
	$("#board img").attr('width','80').attr('height','80');
	$("#board img").mousedown(function(evt){
			if (evt.which==1){leftDown=true;}
			if (evt.which==3){rightDown=true;}
		});
	$("#board img").mousedown(function(evt){if (evt.which==1){
		var it = $(this);
		var x=it.attr('id').split('y')[0];
		var y=it.attr('id').split('y')[1];
		log('' + x + ' ' + y);
		evt.preventDefault();}});
	$("#board img").mouseup(function(evt){
		if (evt.which==1 && leftDown && rightDown){
			var it = $(this);
			openMulti(it);
			log();
		} else if (evt.which==1 && leftDown){
			var me = $(this);
			open(me);
			log();
		} else if (evt.which==3 && rightDown){
			var myself  = $(this);
			flag(myself);
			log();
		}});
	$("#board").bind("contextmenu",function(e){return false;});
	initMines(5);

	log();
};

