let musicInfo = [];
let musicInfoCheck = [];
let $playList = $('.playlist');
let api = {
  root: "https://itunes.apple.com/search?term=",
}
let genres = new Set;

let help = 0; //indicates if genres should be added to list when using insertResponse function

function addSongFromField(event) {
  event.preventDefault();

  const info = $('#musicField').eq(0).val();

  if (info) { //if valid keyword was provided

    $('#getPlaylistBtn').removeAttr('disabled','')

    const infoCheck = info.toLowerCase(); 
    //doubles musicInfo to check if this keyword was already in list (considering register)
    if (!musicInfoCheck.includes(infoCheck)) {
      musicInfoCheck.push(infoCheck);
      musicInfo.push(info);
    }
    
    else alert('This keyword was already chosen!');
    renderList();
    $('#musicField').eq(0).val('');

  }

  else alert('Provide valid keyword!')
  
}

$('#addButton').click(addSongFromField);

$('#musicField').keyup(function(event) {
  if (event.which == 13) { // User presses Enter
    addSongFromField(event);
  }
});

function renderList() {
  const $list = $('.info').eq(0);

  $list.empty();

  for (const info of musicInfo) {
    const $item = $('<li class="list-group-item d-flex justify-content-between">').text(info);
    $item.append('<button type="button" class="btn-close" aria-label="Close"></button>')
    $list.append($item)
  }
}

$('#getPlaylistBtn').click(function (event) {
  help = 0;
  makeForm(musicInfo);
  $playList.empty();
  $playList.append('<div>Loading Playlist!</div>')
  
  new Promise(function(resolve) {

    let counter = 0; //counts how many times ajax request was sent

    newMusicInfo.forEach(function(item) {
      $.ajax({
        url: api.root + item + "&media=music&limit=3",
        success: function(response) {
          ++counter;
          insertResponse(response);
          if (counter == $('.info').children().length) resolve() 
        },
        error: function() {
          console.log(error);
          ++counter;
          if (counter == $('.info').children().length) resolve()
        },
      })
    })
  }).then(function() {
    addByGenre(genres) //singles found by keywords were added, now search by their genres starts
  })
});





let trackList = new Set;
let positions = []


function insertResponse(response) {
  //getting result from db
  let result = JSON.parse(response);
  let singleList = result.results;
  
  for (let item of singleList) {

    let str = item.artistName + ' - ' + item.trackName;
    let fullStr = str + '###' + item.trackViewUrl;
    
    if (!trackList.has(str)) { //helps not to add a single twice

      if (help == 0) {
        genres.add(item.primaryGenreName); 
        //getting genre name if function is called for keywords search
      }
      
      trackList.add(str)
      positions.push(fullStr); //an array of singles to sort before inserting on page
      
    }
    
}
}

function addByGenre(genres) {
  help = 1; //now in insertResponse genres won't be added

  new Promise(function(resolve) {

    let counter = 0; //counts how many times ajax request was sent

    genres.forEach(function(item) {
      $.ajax({
        url: api.root + item + "&media=music&limit=1",
        success: function(response) {

          insertResponse(response);
          ++counter;

          if (counter == genres.size) resolve()
        },
        error: function(error) {

          console.log(error);
          ++counter;

          if (counter == genres.size) resolve();
        },
      })
    })
  }).then(function() {
    //sorting an array of all singles randomly
    positions.sort(function() {
      if (Math.random() > 0.5) return 1;
      else return -1;
    });

    $playList.empty();
    for (let item of positions) {
      //inserting singles on page
      let arr = item.split('###');
      let $point = $('<li class="list-group-item"></li');
      $point.append($(`<a href = "${arr[1]}" class="text-reset"></a`).text(arr[0]));
      $point.appendTo($playList);

    }
  })  
}

function makeForm(arr) { //if keyword consist of 2 or more words
  return newMusicInfo = arr.map(function(item) {
    if (item.includes(' ')) {
      return item.split(' ').join('+');
    }
    else return item;
  })
}

$('.info').click(function(event) {
  //function for close buttons
  if ($(event.target).hasClass('btn-close')) {
    $(event.target).parent().remove();

    let keyword = $(event.target).parent().text();
    
    let index = musicInfo.indexOf(keyword);
    musicInfo.splice(index,1);
    let indexCheck = musicInfoCheck.indexOf(keyword.toLowerCase());
    musicInfoCheck.splice(indexCheck,1);

    if (musicInfo.length == 0) $('#getPlaylistBtn').attr('disabled','')
    }
})




