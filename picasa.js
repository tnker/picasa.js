jQuery.scope = function(target, func){return function(){func.apply(target, arguments);}};

function Picasa() {}

/**
 * 出力用HTMLノード（デフォルト値、上書き可）
 * 
 * 各出力項目は設定されたキーワードを記述しておくで、実際の文字列に置換されます
 * なお、各出力項目の正規表現は変更可能です。
 * （変更した場合、デフォルトのノードでは出力に不備が生じます）
 * 
 * 【各出力項目のデフォルトキーワード】
 * 
 * - 写真タイトル(プロパティー名：Picasa.prototype.titleReg)
 *   デフォルトキーワード：[[title]]
 * 
 * - サムネイル画像パス(プロパティー値：Picasa.prototype.thumbReg)
 *   デフォルトキーワード：[[thumbnail]]
 *   (サムネイルの表示サイズの変更は、Picasa.prototype.thumbSizeで。)
 * 
 * - 原寸大画像リンク先(プロパティー値：Picasa.prototype.linkReg)
 *   デフォルトキーワード：[[link]]
 * 
 * - コピーライト(プロパティー値：Picasa.prototype.copyrightReg)
 *   デフォルトキーワード：[[copyright]]
 *   (Picasa.prototype.copyrightLangより表示言語の設定可(日本語or英語))
 * 
 * - Exif情報 露出(プロパティー値：Picasa.prototype.exifReg.exposure)
 *   デフォルトキーワード：[[exif.exposure]]
 * 
 * - Exif情報 発光(プロパティー値：Picasa.prototype.exifReg.flash)
 *   デフォルトキーワード：[[exif.flash]]
 * 
 * - Exif情報 焦点距離(プロパティー値：Picasa.prototype.exifReg.focallength)
 *   デフォルトキーワード：[[exif.focallength]]
 * 
 * - Exif情報 絞り値(プロパティー値：Picasa.prototype.exifReg.fstop)
 *   デフォルトキーワード：[[exif.fstop]]
 * 
 * - Exif情報 ユニークID(プロパティー値：Picasa.prototype.exifReg.imageUnigueID)
 *   デフォルトキーワード：[[exif.imageUnigueID]]
 * 
 * - Exif情報 ISO(プロパティー値：Picasa.prototype.exifReg.iso)
 *   デフォルトキーワード：[[exif.iso]]
 * 
 * - Exif情報 カメラメーカー(プロパティー値：Picasa.prototype.exifReg.make)
 *   デフォルトキーワード：[[exif.make]]
 * 
 * - Exif情報 カメラモデル(プロパティー値：Picasa.prototype.exifReg.model)
 *   デフォルトキーワード：[[exif.model]] 
 * 
 * - Exif情報 日時(プロパティー値:Picasa.prototype.exifReg.time)
 *   デフォルトキーワード：[[exif.time]] 
 * 
 */
Picasa.prototype.blockDOM = "\
<div>\
	<h1><a href='[[link]]'>[[title]]</a></h1>\
	<a href='[[link]]'><img src='[[thumbnail]]'></a>\
	<dl>\
		<dt>exposure</dt>\
		<dd>[[exif.exposure]]</dd>\
		<dt>flash</dt>\
		<dd>[[exif.flash]]</dd>\
		<dt>focallength</dt>\
		<dd>[[exif.focallength]]</dd>\
		<dt>fstop</dt>\
		<dd>[[exif.fstop]]</dd>\
		<!--\
		<dt>imageUniqueID</dt>\
		<dd>[[exif.imageUnigueID]]</dd>\
		-->\
		<dt>iso</dt>\
		<dd>[[exif.iso]]</dd>\
		<dt>make</dt>\
		<dd>[[exif.make]]</dd>\
		<dt>model</dt>\
		<dd>[[exif.model]]</dd>\
		<dt>time</dt>\
		<dd>[[exif.time]]</dd>\
	</dl>\
	<blockqute>[[copyright]]</blockqute>\
</div>";

/**
 * 初期設定
 * @param {String} _user
 * @param {String} _album
 */
Picasa.prototype.init = function(_user, _album)
{
	this.user		= _user;
	this.album		= _album;
}

/** Googleアカウント名（@gmail.comは不必要） */
Picasa.prototype.user = null;

/** PicasaWebに登録してあるアルバム名 */
Picasa.prototype.album = null;

/** 写真取得処理が完了後コールバック */
Picasa.prototype.callback = null;

/**
 * 写真取得時のサムネイルサイズ
 * 0: 小
 * 1: 中
 * 2: 大
 */
Picasa.prototype.thumbSize = 1;

/**
 * 写真取得完了後に自動でappendする場合
 * id又はclassを指定（例：.xxx or #xxx）
 * 
 * 指定しない場合は、写真取得完了後にDOMを戻す
 */
Picasa.prototype.target = null;

/** タイトル置換用RegExp（デフォルト：/\[\[title\]\]/） */
Picasa.prototype.titleReg = /\[\[title\]\]/;

/**
 * Exif情報置換用RegExp
 * - exposure
 * - flash
 * - focallength
 * - fstop
 * - imageUnigueID
 * - iso
 * - make
 * - model
 * - time
 */
Picasa.prototype.exifReg = {
	exposure:		/\[\[exif.exposure\]\]/,
	flash:			/\[\[exif.flash\]\]/,
	focallength:	/\[\[exif.focallength\]\]/,
	fstop:			/\[\[exif.fstop\]\]/,
	imageUnigueID:	/\[\[exif.imageUnigueID\]\]/,
	iso:			/\[\[exif.iso\]\]/,
	make:			/\[\[exif.make\]\]/,
	model:			/\[\[exif.model\]\]/,
	time:			/\[\[exif.time\]\]/
};

/** コピーライト置換用RegExp（デフォルト：/\[\[copyright\]\]/） */
Picasa.prototype.copyrightReg = /\[\[copyright\]\]/;

/** 
 * コピーライト表示言語
 * JP or EN
 */
Picasa.prototype.copyrightLang = "JP";

/** 写真原寸大リンク置換用RegExp（デフォルト：/\[\[link\]\]/） */
Picasa.prototype.linkReg = /\[\[link\]\]/g;

/** 写真サムネイルパス置換用ReqExp（デフォルト：/\[\[thumbnail\]\]/） */
Picasa.prototype.thumbReg = /\[\[thumbnail\]\]/;

/**
 * アルバムを取得
 * @param {Function} _callback
 */
Picasa.prototype.get = function(_callback)
{
	this.callback	= _callback;
	$.getJSON(
		"http://picasaweb.google.com/data/feed/api/user/" + this.user
		+ "?kind=album&alt=json-in-script&callback=?", {}, $.scope(this,this.albumCallback));
}

Picasa.prototype.albumCallback = function(data)
{
	var response = null;
	for (var i = 0; i < data.feed.entry.length; i++)
		if (data.feed.entry[i].gphoto$name.$t == this.album) response = data.feed.entry[i];
	
	if (response != null)
		$.getJSON(
			"http://picasaweb.google.com/data/feed/api/user/" + this.user + "/albumid/" + response.gphoto$id.$t
			+ "?kind=photo&alt=json-in-script&callback=?", {}, $.scope(this,this.thumbCallback));
	else return;
}


Picasa.prototype.thumbCallback = function(data)
{
	var response = "";
	
	for (var i = 0; i < data.feed.entry.length; i++)
	{
		var entry = data.feed.entry[i],
			block = this.clone(this.blockDOM);
		
		// replace title
		block = this.blockDOM.replace(this.titleReg, entry.summary.$t);
		// replace copyright
		block = block.replace(
			this.copyrightReg,
			(this.copyrightLang=="JP")?entry.gphoto$license.name:entry.gphoto$license.$t);
		// replace exif.exposure
		if (entry.exif$tags.hasOwnProperty("exif$exposure"))
			block = block.replace(this.exifReg.exposure,entry.exif$tags.exif$exposure.$t);
		// replace exif.flash
		if (entry.exif$tags.hasOwnProperty("exif$flash"))
			block = block.replace(this.exifReg.flash,entry.exif$tags.exif$flash.$t);
		// replace exif.focallength
		if (entry.exif$tags.hasOwnProperty("exif$focallength"))
			block = block.replace(this.exifReg.focallength,entry.exif$tags.exif$focallength.$t);
		// replace exif.fstop
		if (entry.exif$tags.hasOwnProperty("exif$fstop"))
			block = block.replace(this.exifReg.fstop,entry.exif$tags.exif$fstop.$t);
		// replace exif.imageUniqueID
		if (entry.exif$tags.hasOwnProperty("exif$imageUnigueID"))
			block = block.replace(this.exifReg.imageUnigueID,entry.exif$tags.exif$imageUnigueID.$t);
		// replace exif.iso
		if (entry.exif$tags.hasOwnProperty("exif$iso"))
			block = block.replace(this.exifReg.iso,entry.exif$tags.exif$iso.$t);
		// replace exif.make
		if (entry.exif$tags.hasOwnProperty("exif$make"))
			block = block.replace(this.exifReg.make,entry.exif$tags.exif$make.$t);
		// replace model
		if (entry.exif$tags.hasOwnProperty("exif$model"))
			block = block.replace(this.exifReg.model,entry.exif$tags.exif$model.$t);
		// replace time
		if (entry.exif$tags.hasOwnProperty("exif$time"))
			block = block.replace(this.exifReg.time,entry.exif$tags.exif$time.$t);
		// replace thumbnail
		block = block.replace(this.thumbReg,entry.media$group.media$thumbnail[this.thumbSize].url);
		// replace link
		block = block.replace(this.linkReg,entry.media$group.media$content[0].url);
		
		response += block + "\n";
	}
	
	if (this.target != null && this.target != "")
		$(this.target).append(response);
	else if (this.callback instanceof Function)
		if (this.callback != null && this.callback != undefined)
			this.callback(response);
}

/**
 * ノードのクローン用
 * @param {Object} o
 */
Picasa.prototype.clone = function(o)
{
	var f = function(){};
	f.prototype = o;
	return new f;
}



