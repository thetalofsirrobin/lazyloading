// ==UserScript==
// @name        EH - Images LazyLoad
// @namespace   Hentai
// @match       https://e-hentai.org/s/*
// @match       https://exhentai.org/s/*
// @version     1.3
// @author      Felipons
// @contributor taleofsirrobin
// ==/UserScript==

/**   Helpful functions   **/
var $ = e => document.querySelector(e);
var $$ = e => document.querySelectorAll(e);
Object.prototype.In = function (t) { for (var r = 0; r < t.length; r++)if (t[r] == this) return !0; return !1; };
var getOffset = function (t) { const n = t.getBoundingClientRect(); return { left: n.left + window.scrollX, top: n.top + window.scrollY }; };
var detect_swipe = function (e, t, a) { var n, c, h, i = !1; e.addEventListener('touchstart', function (e) { var t = e.changedTouches[0]; n = t.pageX, c = t.pageY, h = (new Date).getTime(), i = !1; }, !1), e.addEventListener('touchmove', function (e) { i = !0; }, !1), e.addEventListener('touchend', function (e) { if (i) { var s = e.changedTouches[0], d = s.pageX - n, o = s.pageY - c; t && (new Date).getTime() - h <= 600 && (Math.abs(d) >= 150 && Math.abs(o) <= 100 ? t(d < 0 ? 'left' : 'right') : Math.abs(o) >= 150 && Math.abs(d) <= 100 && t(o < 0 ? 'up' : 'down')); } else a && a(e); }, !1); };
var lock_swipe = function (e) { e.addEventListener('touchstart', function (e) { e.preventDefault(); }); e.addEventListener('touchmove', function (e) { e.preventDefault(); }); };

/***************************/
/**         Style         **/
var style = `
<style>
    body {
        background: #34353b;
        color: #f1f1f1;
    }
        body a {
            color: #DDD;
        }

    #i1 {
        max-width: unset !important;
        min-width: unset !important;
        margin: 2px auto 0;
        width: unset !important;
        background: #34353b;
        border: unset;
        padding-bottom: 0;
    }

        #i1 > h1 {
            white-space: nowrap;
        }

    #i2 a, #i4 a {
        cursor: pointer;
    }

    #i3 {
        width: unset !important;
    }

    #i3 img {
        max-width: calc(100vw - 50px) !important;
        min-width: 700px;
        max-height: unset !important;
        height: unset !important;
        width: unset !important;
    }

    #i3.fullscreen {
        min-height: calc(100vh - 35px);
    }

        #i3.fullscreen img {
            max-width: 100vw !important;
            max-height: calc(100vh - 37px) !important;
            min-width: unset !important;
            height: unset !important;
            width: unset !important;
        }

    #i4 .sn {
        margin: 0 auto;
    }

    .dp {
        margin: 0 auto 15px !important;
    }

    #i5 .sb {
        margin-top: -5px;
    }
</style>
`;

document.head.innerHTML += style;
/***************************/
/**         Events        **/
document.onkeydown = function (e) {
  if (e.altKey || e.ctrlKey || e.metaKey) {
    holdingOverrideKey = true;
    return;
  }

  var a = window.event ? e.keyCode : e.which;

  if (e.shiftKey) {
    if (a == KeyEvent.DOM_VK_SPACE) {
      scroll_space(true);
      cancelEvent(e);
    }
  } else {
    if (a.In([KeyEvent.DOM_VK_NUMPAD6, KeyEvent.DOM_VK_RIGHT, KeyEvent.DOM_VK_D])) // Next
      $('#next').onclick();

    else if (a.In([KeyEvent.DOM_VK_NUMPAD4, KeyEvent.DOM_VK_LEFT, KeyEvent.DOM_VK_A])) // Prev
      $('#prev').onclick();

    else if (a.In([KeyEvent.DOM_VK_NUMPAD9, KeyEvent.DOM_VK_X])) // Load All
      lazyLoad.LoadAll();

    else if (a.In([KeyEvent.DOM_VK_NUMPAD0, KeyEvent.DOM_VK_NUMPAD7, KeyEvent.DOM_VK_F])) // Fullscreen
      lazyLoad.Fullscreen();

    else if (a.In([KeyEvent.DOM_VK_NUMPAD3, KeyEvent.DOM_VK_H])) // Show Hide Text at the Bottom
      lazyLoad.BottomText();

    else if (a.In([KeyEvent.DOM_VK_NUMPAD1, KeyEvent.DOM_VK_Q])) // Go Back to Gallery
      $('.sb a').click()

    else if (a.In([KeyEvent.DOM_VK_NUMPAD2, KeyEvent.DOM_VK_R])) // Reload Image
      lazyLoad.ReloadImage();

    else if (a.In([KeyEvent.DOM_VK_NUMPAD8, KeyEvent.DOM_VK_W])) // Scroll UP
      window.scrollBy(0, -50);

    else if (a.In([KeyEvent.DOM_VK_NUMPAD5, KeyEvent.DOM_VK_S])) // Scroll Down
      window.scrollBy(0, 50);

    else if (a.In([KeyEvent.DOM_VK_SPACE])) // Space
      if (lazyLoad.IsFullscreen == 'Y')
        $('#next').onclick();
      else
        scroll_space(false);

    else
      return;

    cancelEvent(e);
  }
};


if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) { // Android
  detect_swipe($('#i3'), function (swipe) {
    if (swipe == 'left')
      $('#next').onclick();
    else if (swipe == 'right')
      $('#prev').onclick();
    else if (swipe == 'up')
      lazyLoad.ReloadImage();
    else if (swipe == 'down')
      lazyLoad.Fullscreen();
  }, function (e) {
    var clientX = e.changedTouches[0].clientX,
      total = document.body.clientWidth;

    if (clientX / total > .5)
      $('#next').click();
    else
      $('#prev').click();
  });
} else { // PC
  $('#i3').addEventListener('click', function (e) {
    var clientX = e.clientX,
      total = document.body.clientWidth;

    if (clientX / total > .5)
      $('#next').click();
    else
      $('#prev').click();
  })
}
/***************************/

var Status = {
  New: 0,
  Loading: 1,
  Completed: 2,
  Error: 3,
  Reload: 4,
};

window['lazyLoad'] = {
  Title: '',
  Page: {},
  Pages: [],
  MaxPage: 9999,
  IsFullscreen: false,
  ShowBottomText: false,

  LoadingAll: 0,
  MaxLoadAll: 4,
  LoadAllCount: 0,
  MaxLoadNext: 2,

  Start: function () {
    var path = location.pathname.split('/');
    var imgKey = path[2];
    var pid = parseInt(path[3].split('-')[1]);
    var i6 = $('#i6').innerHTML;
    var i7 = $('#i7').innerHTML;

    this.Page = { imgKey, pid, status: Status.Completed, i6, i7 };
    this.Pages.push(this.Page);
    this.MaxPage = parseInt($$('#i2 .sn div span')[1].innerText);
    this.Title = document.title;

    $('.dp').innerHTML += "&nbsp; <a href='javascript: lazyLoad.LoadAll(); '>Load All</a>" // eslint-disable-line

    // Fullscreen
    if (localStorage['lazyLoad.Fullscreen']) {
      this.IsFullscreen = localStorage['lazyLoad.Fullscreen'] == 'true' ? true : false;

      if (this.IsFullscreen) {
        $('#i3').className = 'fullscreen';
        setTimeout(() => window.scrollTo(0, getOffset($('#i3')).top), 100);
      }
    }
    else
      localStorage['lazyLoad.Fullscreen'] = this.IsFullscreen;


    // Bottom Text
    if (localStorage['lazyLoad.BottomText']) {
      this.ShowBottomText = localStorage['lazyLoad.BottomText'] == 'true' ? true : false;

      if (this.ShowBottomText) {
        $('.dp').style.display = 'none';
        $('#i5').style.display = 'none';
        $('#i6').style.display = 'none';
        $('#i7').style.display = 'none';
      }
    } else
      localStorage['lazyLoad.BottomText'] = this.ShowBottomText;

    this.CheckButtons();
    this.LoadNext(this.Page, 0);

  },
  CheckLink: function (a) {
    var pageInfo = a.onclick.toString();
    pageInfo = pageInfo
      .substr(pageInfo.indexOf('load_image(') + 11)
      .replace(')\n}', '')
      .replace(/'/g, '')
      .split(',');

    if (pageInfo.length != 2)
      return;

    var pid = parseInt(pageInfo[0]);
    this.UpdateButtons(a, pid);
    var hasPage = this.Pages.filter(e => e.pid == pid);

    if (hasPage.length == 0)
      this.Pages.push({ imgKey: pageInfo[1].trim(), pid, status: Status.New, i6: '', i7: '' });
  },
  UpdateButtons: function (a, pid) {
    a.removeAttribute('href');
    a.removeAttribute('onclick');
    a.role = 'button';
    a.onclick = () => lazyLoad.Load(pid);

    if (a.className == 'images') {
      a.querySelector('img').removeAttribute('onerror');
      a.querySelector('img').onerror = () => {
        var img = this;

        if (!Object.hasimg('retryCount')) {
          img.retryCount = 0;
          img.base_url = img.src;
        } else {
          img.retryCount = parseInt(img.retryCount) + 1;
        }

        if (img.retryCount < 10) {
          setTimeout(() => img.src = img.base_url + '?' + img.retryCount, 1000);
        }
      };
    }
  },

  Load: function (pid, loadLevel = 0) {
    var page = this.Pages.filter(e => e.pid == pid)[0];

    if (loadLevel == 0 && page && page.status == Status.Completed && this.Page.pid != pid) {
      this.LoadImage(page);
      this.AddHistory(page);
      this.LoadNext(page, loadLevel);

      return;
    }

    if ((this.Page.pid == pid && !page.status.In([Status.Error, Status.Reload])) || !page || page.status.In([Status.Loading, Status.Completed]))
      return;

    page.status = Status.Loading;

    if (loadLevel == 0)
      this.AddHistory(page);

    this.Request(page, loadLevel);

    return true;
  },
  LoadAll: function () {
    if (lazyLoad.LoadingAll == 0) {
      document.title = 'Loading...'
      lazyLoad.LoadingAll = setInterval(o => {
        if (lazyLoad.LoadAllCount >= lazyLoad.MaxLoadAll)
          return; // WAIT

        var statusNew = lazyLoad.Pages.filter(e => e.status == Status.New);
        for (var i = 0; i < statusNew.length; i++) {
          lazyLoad.Load(statusNew[i].pid, -1);

          if (lazyLoad.LoadAllCount >= lazyLoad.MaxLoadAll)
            return false;
        }

        if (statusNew.length == 0) {
          var statusLoading = lazyLoad.Pages.filter(e => e.status == Status.Loading);

          if (statusLoading.length == 0) {
            document.title = lazyLoad.Title;
            clearInterval(lazyLoad.LoadingAll);
            lazyLoad.LoadingAll = 0;
          }
        }

        statusNew = lazyLoad.Pages.filter(e => e.status == Status.New);
        for (var i = 0; i < statusNew.length; i++) {
          lazyLoad.Load(statusNew[i].pid, -1);

          if (lazyLoad.LoadAllCount >= lazyLoad.MaxLoadAll)
            return
        }
      }, 1000);
    } else {
      document.title = lazyLoad.Title;
      clearInterval(lazyLoad.LoadingAll);
      lazyLoad.LoadingAll = 0;
    }
  },
  LoadNext: function (page, loadLevel) {
    if (loadLevel < this.MaxLoadNext) {
      let next = page.pid < this.MaxPage ? page.pid + 1 : -1;
      let nextLevel = loadLevel + 1;
      let prev = page.pid > 1 ? page.pid - 1 : -1;
      let prevLevel = loadLevel + 1;

      next = this.Pages.filter(e => e.pid == next)[0];
      while (nextLevel < this.MaxLoadNext && next && next.status.In([Status.Loading, Status.Completed])) {
        next = next.pid < this.MaxPage ? next.pid + 1 : -1;
        next = this.Pages.filter(e => e.pid == next)[0];
        nextLevel++;
      }

      if (next && next.status == Status.New)
        lazyLoad.Load(next.pid, nextLevel);

      prev = this.Pages.filter(e => e.pid == prev)[0];
      while (prevLevel < this.MaxLoadNext && prev && prev.status.In([Status.Loading, Status.Completed])) {
        prev = prev.pid > 1 ? prev.pid - 1 : -1;
        prev = this.Pages.filter(e => e.pid == prev)[0];
        prevLevel++;
      }


      if (prev && prev.status == Status.New)
        lazyLoad.Load(prev.pid, nextLevel);
    }
  },

  AddHistory: function (page) {
    if (history.pushState) {
      var link = `${location.origin}/s/${page.imgKey}/${gid}-${page.pid}`;
      history.pushState({ page, imgKey: page.imgKey }, document.title, link);
    }
  },
  Fullscreen: function () {
    this.IsFullscreen = !this.IsFullscreen;
    localStorage['lazyLoad.Fullscreen'] = this.IsFullscreen;

    if (this.IsFullscreen) {
      $('#i3').className = 'fullscreen';
      window.scrollTo(0, getOffset($('#i3')).top);
    }
    else
      $('#i3').className = '';
  },
  BottomText: function () {
    this.ShowBottomText = !this.ShowBottomText;
    localStorage['lazyLoad.BottomText'] = this.ShowBottomText;

    if (this.ShowBottomText) {
      $('.dp').style.display = 'none';
      $('#i5').style.display = 'none';
      $('#i6').style.display = 'none';
      $('#i7').style.display = 'none';
    } else {
      $('.dp').style.display = 'unset';
      $('#i5').style.display = 'unset';
      $('#i6').style.display = 'unset';
      $('#i7').style.display = 'unset';
    }
  },

  LoadImage: function (page) {
    this.Page = page;
    var pid = page.pid;

    $$('.images').forEach(e => e.style.display = 'none');
    $(`#img_${pid}`).style.display = 'unset';

    $('#i2 .sn div span').innerText = pid;
    $('#i4 .sn div span').innerText = pid;

    $$('#next').forEach(a => { this.UpdateButtons(a, pid + 1 > this.MaxPage ? this.MaxPage : pid + 1) });
    $$('#prev').forEach(a => { this.UpdateButtons(a, pid - 1 < 1 ? 1 : pid - 1) });

    $('#i6').innerHTML = this.Page.i6;
    $('#i7').innerHTML = this.Page.i7;

    window.scrollTo(0, getOffset($('#i3')).top);
  },
  ReloadImage: function () {
    var pid = this.Page.pid;
    $('#img_' + pid).remove();

    var page = this.Pages.filter(e => e.pid == pid)[0];
    page.status = Status.Reload;
    page.i6 = '';
    page.i7 = '';
    lazyLoad.Load(pid);
  },

  CheckButtons: function (i2 = $$('#i2 .sn > a'), i3 = $$('#i3 > a:not(.images)'), i4 = $$('#i4 .sn > a')) {
    i2.forEach(a => { this.CheckLink(a) });
    i3.forEach(a => {
      a.id = `img_${this.Page.pid}`;
      a.className = 'images';
      a.role = 'button';
      a.onclick = function (e) { e.preventDefault(); };
      lock_swipe(a);
    });
    i4.forEach(a => { this.CheckLink(a) });

    if ($('#i2 > div:not(.sn)'))
      $('#i2 > div:not(.sn)').remove();
    if ($('#i4 > div:not(.sn)'))
      $('#i4 > div:not(.sn)').remove();
  },

  Request: function (page, loadLevel) {
    //var api_url = 'https://exhentai.org/api.php';
    //var api_url = 'https://api.e-hentai.org/api.php'

    let xhr = new XMLHttpRequest();
    xhr.open('POST', api_url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.withCredentials = true;
    xhr.onreadystatechange = function (info) {
      info = info.originalTarget;

      if (info && info.readyState == 4)
        if (info.status == 200) {
          let jSonResp = JSON.parse(info.responseText);
          lazyLoad.ApplyJson(jSonResp, page, loadLevel);
        } else {
          page.status = Status.Error;
          setTimeout(() => lazyLoad.Load(page.pid), 1500);
        }
    };

    var imgkey = page.imgKey;
    var dto = { method: 'showpage', gid, page: page.pid, imgkey, showkey };
    xhr.send(JSON.stringify(dto));
  },
  ApplyJson: function (json, page, loadLevel) {
    page.i6 = json.i6;
    page.i7 = json.i7;
    page.status = Status.Completed;

    this.CheckJsonButtons(json, page);

    if (loadLevel == -1)
      this.LoadAllCount--;
    else {
      if (loadLevel == 0)
        this.LoadImage(page);

      this.LoadNext(page, loadLevel);
    }
  },
  CheckJsonButtons: function (json, page) {
    // i2
    var i2 = document.createElement('div');
    i2.style.display = 'none';
    i2.innerHTML = json.n + json.i;
    i2 = i2.querySelectorAll('.sn > a');

    // i3
    var a = document.createElement('a');
    a.style.display = 'none';
    a.id = `img_${page.pid}`;
    a.className = 'images';
    a.role = 'button';
    a.onclick = function (e) { e.preventDefault(); };
    lock_swipe(a);

    var i3 = json.i3.substr(json.i3.indexOf('<img'))
    i3.substr(0, i3.indexOf('</a>'))

    a.innerHTML = i3;
    $('#i3').appendChild(a);

    a.querySelector('img').removeAttribute('onerror');
    a.querySelector('img').onerror = () => setTimeout(() => lazyLoad.Load(page.pid), 1500);

    // i4
    var i4 = document.createElement('div');
    i4.style.display = 'none';
    i4.innerHTML = json.i + json.n;
    i4 = i4.querySelectorAll('.sn > a');

    this.CheckButtons(i2, [], i4);
  },
};

var lazyLoad = window['lazyLoad'];

lazyLoad.Start();