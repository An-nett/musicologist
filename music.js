let musicInfo = [];
let $playList = $('.playlist');
let api = {
  root: "https://itunes.apple.com/search?term=",
}

function addSongFromField(event) {
  event.preventDefault();

  const info = $('#musicField').eq(0).val();

  musicInfo.push(info);
  renderList();
  $('#musicField').eq(0).val('');
  console.log(musicInfo);
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
  makeForm(musicInfo);
  $playList.empty();
  newMusicInfo.forEach(function(item) {
    $.ajax({
      url: api.root + item + "&limit=3",
      success: function(response) {
        insertResponse(response);
      }
    })
  })
});

function insertResponse(response) {
  let result = JSON.parse(response);
  console.log(result)
  let singleList = result.results;
  
  for (let item of singleList) {
    let str = item.artistName + ' - ' + item.trackName;
    let $point = $('<li class="list-group-item"></li');
    $point.append($(`<a href = "${item.trackViewUrl}" class="text-reset"></a`).text(str));
    $point.appendTo($playList);
}
}

function makeForm(arr) {
  return newMusicInfo = arr.map(function(item) {
    if (item.includes(' ')) {
      return item.split(' ').join('+');
    }
    else return item;
  })
}

$('.info').click(function(event) {
  if ($(event.target).hasClass('btn-close')) {
    $(event.target).parent().remove();
    let keyword = $(event.target).parent().text();
    let index = musicInfo.indexOf(keyword);
    musicInfo = musicInfo.splice(index-1,1);
    }
})




