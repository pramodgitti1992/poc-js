function Table() {
  let url = 'https://hn.algolia.com/api/v1/search?query=foo&tags=story&page=';
  let container = document.querySelector('.drawTable');
	this.doc = document;
  this.url = url;
  this.pageNumber = 2;
	this.container = container;
  this.prevItemsBtn = this.doc.querySelector('.previousPage');
  this.moreItemsBtn = this.doc.querySelector('.nextPage');
  this.onPreviousPageClick = this.onPreviousPageClick.bind(this);
  this.onNextPageClick = this.onNextPageClick.bind(this);
  this.upvoteButton = this.doc.querySelector('.upvote-button');
  this.upvoteButton = this.onUpVoteButtonClick.bind(this);
  this.onHideButton = this.onHideButton.bind(this);
  this.container.addEventListener('click',this.onUpVoteButtonClick,false);
}


function getUrl(url) {
	return url.replace('http://','').replace('https://','').split('/')[0];
}


function drawGraph(xArray,dataArray){
  var title = {
    text: ''
 };
 var subtitle = {
    text: ''
 };
  var xAxis = {
     categories: xArray
 };
 var yAxis = {
  title: {
    text: 'Votes'
 },
};

 var series =  [
    {
       name:"ID",
       data: dataArray
    }
 ];

 var json = {};
 json.title = title;
 json.subtitle = subtitle;
 json.xAxis = xAxis;
 json.yAxis = yAxis;
 json.series = series;

 $('#highchart').highcharts(json);
}

Table.prototype.hideValue = (function(id) {
  let removeData = JSON.parse(localStorage.getItem("post"));
    let d = removeData.filter(remove => remove.objectID !== id)

   return  localStorage.setItem("post",JSON.stringify(d))

})

Table.prototype.onHideButton = (function(e) {
	let targetRow = e.target.closest('tr');
	this.hideValue(targetRow.dataset.id);
		targetRow.style.display = 'none';

})

Table.prototype.onUpVoteButtonClick = (function (e){

  let td1 = e.target.closest('tr').firstElementChild;
  let te1 = e.target.closest('tr');
  let dt1 = te1.dataset.id;
  let targetId = td1.nextSibling;
  let pointsTD = targetId.nextSibling;
  let upvotes = localStorage.getItem('upvotes');
  upvotes = JSON.parse(upvotes);
  if(upvotes == null || upvotes.points == undefined){

    upvotes = { votes: [],points:[]};
    upvotes.votes.push(dt1);
    upvotes.points.push( {  key:dt1, value: pointsTD.textContent });
  }else{
    votes = upvotes.votes;
    upvotes.votes.push(dt1);
    upvotes.points.push({  key:dt1, value: pointsTD.textContent })
  }
  localStorage.setItem('upvotes',JSON.stringify(upvotes));
  updateRow(te1);
	

});

Table.prototype.onPreviousPageClick = (function(e) {
	this.pageNumber -= 1;
	this.load();
})

Table.prototype.onNextPageClick = (function(e) {
	this.pageNumber += 1;
	this.load();
})

function updateRow(row) {
	let upvote = row.querySelector('.points'),
  upvoteCount = parseInt(upvote.textContent);
  //let upvoteButton = row.querySelector('.upvote-button');
	upvote.classList.add('upvoted');
	upvote.innerHTML = '';
  upvote.appendChild(document.createTextNode((upvoteCount+1)))
  let todos = JSON.parse(localStorage.getItem("post"));

  var i = 0;
  while( (row = row.previousSibling) != null ) 
  i++;

  let xArray = [];
  let dataValue = [];
  todos[i].points = parseInt(todos[i].points) + 1;
   for(k=0;k< todos.length; k++){
    xArray.push(todos[k].num_comments);
    dataValue.push(todos[k].points);
   }
   
   localStorage.setItem("post",JSON.stringify(todos));
   drawGraph(xArray,dataValue);

}

Table.prototype.renderTable = (function(data) {
    let tbody = document.createElement('tbody');
	  let	value = data, xArray = [],dataValue = [],todos=[];
    tbody.classList.add('listvalues');
    let posts = JSON.parse(localStorage.getItem('post'));
    let post;
    for (const key in value) {
      let todo = value[key];
      let domain;
      if(todo.url != null){
         domain =  getUrl(todo.url);
      }
    
     
    todos.push({ id: key,
      author: todo.author,
      num_comments:todo.num_comments,
      title:todo.title,
      points:todo.points,
      url:todo.url && todo.url.replace('http://','').replace('https://','').split('/')[0],
      time:todo.created_at

   });
    localStorage.setItem("post",JSON.stringify(todos))
    xArray.push(todo.num_comments);
    //dataValue.push(parseInt(todo.points)+1);
		let tableCreate = `<tr data-id="${todo.objectID}" class="table-list">
			<td><span className="comments">${todo.num_comments}</span><td>
			<td><span class="points">${todo.points}</span></td>&emsp;&emsp;
			<td class="uparrow"><a aria-label="Upvote button" className="upvote-button">&#x25B4;</a></td>
			<td>
				<span class="title">${todo.title}</span>
				<span class="domain">(${domain})</span> by
				<span class="author">${todo.author}</span>
				<span class="createdat"> ${convertTime(todo.created_at)} <span>
        <span>[<button aria-label="Hide button" class="hide-button">hide</button>]</span>

			</td>
		</tr>`


    let upvotedItems = JSON.parse(localStorage.getItem('upvotes'));
    
    let myId = '"'+todo.objectID+'"';
   if(upvotedItems != null &&   upvotedItems.votes.includes(todo.objectID)){
    dataValue.push((todo.points)+1);
   }else{
    dataValue.push(todo.points);
   }

		let tablelist = document.createElement('tbody');
    tablelist.innerHTML = tableCreate;
    
    
    if(upvotedItems != null && upvotedItems != undefined){
    for(let j=0; j < upvotedItems.votes.length; j++){
        if(upvotedItems.votes[j] == todo.objectID){
           updateRow(tablelist.firstChild);
           
        }

    }
  }

    tbody.appendChild(tablelist.firstChild);



	}
	this.container.innerHTML = '';
  this.container.appendChild(tbody);

  this.moreItemsBtn.addEventListener('click', this.onNextPageClick, false)
  this.prevItemsBtn.addEventListener('click', this.onPreviousPageClick, false)
  
  
  //this.upvoteButton.addEventListener('click', this.onUpVoteButtonClick, false)
  
  
  drawGraph(xArray,dataValue);
  
  this.upvoteButton = document.getElementsByClassName('upvote-button');

  for(let i=0; i < this.upvoteButton.length; i++){

      this.upvoteButton[i].addEventListener('click', this.onUpVoteButtonClick, false)
  }


});

Table.prototype.load = (function() {
  let url = this.url + this.pageNumber;
    fetch(url)
    .then(res=>res.json())
		.then(result=>this.renderTable(result.hits))
})
