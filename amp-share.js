(function () {
    amp.plugin('share', function (options) {
        var htmltemplates = {
            alertmsg: '<div class="alert {{type}}" id="divalert"><span class="closebtn" onclick= "this.parentElement.style.display=\'none\';">&times;</span >{{msg}}</div >',
            socialiconhtml: '<div class="vjs-share-socialIcon"> <a target="_blank" href="{{Url}}"><img src="{{IconUrl}}" class="shareicononsharepanel" data-ai="true" data-eleregion="Player" data-catagory="share icon" title="share with"></a></div>',
            sharepanelcust: '<div class="vjs-sharepanel vjs-hidden"><div class="vjs-sharepanel-controls">\n\t<div class=\"vjs-sharepanel-header\">\n\t\t<div class=\"vjs-sharepanel-close\">\n\t\t\t\n\t\t\t\t<a tabindex="0" class=\"vjs-sharepanel-close-image cursor-pointer\"/>\n\t\t\t\t<span class=\"screen-reader-text\">close</a>\n\t\t\t</a>\n\t\t</div>\n\t</div>\n\t<div class=\"vjs-shareoptions\">\n\t\t<div class=\"vjs-shareoptions-social\">\n\t\t\t<label>Share</label>\n\t\t\t<hr/>\n\t\t\t<div class="vjs-shareoptions-socialIcons">{{socialIconsHtml}}</div>\n\t\t</div>\n\t\t<div class=\"vjs-sharepanel-bottom\">\n\t\t\t<div class="vjs-shareoptions-link" >\n\t\t\t\t<label class=\"vjs-label\">Links</label>\n\t\t\t\t<hr/>\n\t\t\t\t<button data-ai="true"   id="openCopyConfirmPopup" title="Copy URL" >Copy Url</button>\n\n\t\t\t</div>\n\t\t\t<div class="vjs-shareoptions-embed vjs-hidden" >\n\t\t\t\t<label>copy</label>\n\t\t\t\t<hr/>\n\t\t\t\t<div class="vjs-shareoptions-embedOption"></div>\n\t\t\t\t<button>local</button>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n  <div class="vjs-sharePanel-CopyConfirmPopupContainer vjs-hidden">\n<a tabindex="0" class="vjs-sharePopup-Closeimage" href=\"javascript:void()\"></a>\n\t\t<label></label>\n        <textarea>Error occur when try to copy content</textarea>\n\t\t<button class="copylinksToClipboard">Copy Video Url</button>\n\t\t <textarea id="txtVideoLocation">Error occur when try to copy content</textarea>\n\t\t<button class="copylinksToClipboard">Copy Video Location</button>\n</div>\n</div></div>'
        }

        var myPlayer = this;

        myPlayer.addEventListener(amp.eventName.loadedmetadata, function () {
            initializeShare();
            initializeSharePopup(options);
        });

        var initializeShare = function () {
            var parentTag = $(".amp-controlbaricons-right");
            var shareButton = document.createElement("div");
            shareButton.setAttribute("class", "amp-share-control vjs-control vjs-button outline-enabled-control");
            shareButton.setAttribute("tabindex", "0");
            shareButton.setAttribute("role", "button");
            shareButton.setAttribute("aria-live", "off");
            shareButton.setAttribute("title", "Social Share");
            parentTag.prepend(shareButton);
            parentTag.on('click', shareButton, bindClick);
            parentTag.on('keydown', shareButton, bindKeydown);
        }

        var initializeSharePopup = function (options) {
            var socialIconsHtml;
            options.socialShareIcons.forEach(function (element) {
                if (socialIconsHtml !== undefined)
                    socialIconsHtml = socialIconsHtml + renderSocialIconHtml(getPredefinedShareIcon(element, options));
                else
                    socialIconsHtml = renderSocialIconHtml(getPredefinedShareIcon(element, options));
            });
            var replacekey = {
                socialIconsHtml: socialIconsHtml
            };
            var custSharePanel = replaceAll(htmltemplates.sharepanelcust, replacekey);
            var rightControlsContainer = document.getElementsByClassName("azuremediaplayer")[0];
            appendHtml(rightControlsContainer, custSharePanel);
        }

        var appendHtml = function (el, str) {
            var div = document.createElement('div');
            div.innerHTML = str;
            while (div.children.length > 0) {
                el.appendChild(div.children[0]);
            }


            $('.vjs-sharepanel-close-image').click(function () {
                $(this).closest('.vjs-sharepanel').addClass('vjs-hidden');
                myPlayer.play();
            })

            $('.vjs-sharepanel-close-image').keydown(function () {
                if (event.keyCode == 13) {
                    $(this).closest('.vjs-sharepanel').addClass('vjs-hidden');
                    myPlayer.play();
                }
            })

            $('.vjs-sharePopup-Closeimage').click(function () {
                $(this).closest('.vjs-sharePanel-CopyConfirmPopupContainer').addClass('vjs-hidden');
            })

            $('.vjs-sharePopup-Closeimage').keydown(function () {
                if (event.keyCode == 13) {
                    $(this).closest('.vjs-sharePanel-CopyConfirmPopupContainer').addClass('vjs-hidden');
                }
            })


            $('.copylinksToClipboard').click(function () {
                var selectorTextArea = $(this).prev('textarea');
                ClipBoardHelper.tryCopyTextToClipboard(selectorTextArea, selectorTextArea.val());

            })

            $("#openCopyConfirmPopup").click(function () {
                $('.vjs-sharePanel-CopyConfirmPopupContainer textarea').first().val(getCurrentPageUrl(options));
                $('.vjs-sharePanel-CopyConfirmPopupContainer textarea').last().val(getCurrentPageUrl(options) + "?l=" + myPlayer.currentTime());
                $('.vjs-sharePanel-CopyConfirmPopupContainer ').removeClass('vjs-hidden');
                trapFocus($('.vjs-sharePanel-CopyConfirmPopupContainer')[0]);
            })
        }
        var trapFocus = function (element, lastEl) {

            var focusableEls = element.querySelectorAll('a, button, textarea, input[type="text"]'),
                firstFocusableEl = focusableEls[0];
            firstFocusableEl.focus();
            if (lastEl !== undefined)
                lastFocusableEl = lastEl
            else
                lastFocusableEl = focusableEls[focusableEls.length - 1];

            KEYCODE_TAB = 9;

            element.addEventListener('keydown', function (e) {
                var isTabPressed = (e.key === 'Tab' || e.keyCode === KEYCODE_TAB);

                if (!isTabPressed) {
                    return;
                }

                if (e.shiftKey) /* shift + tab */ {
                    if (document.activeElement === firstFocusableEl) {
                        lastFocusableEl.focus();
                        e.preventDefault();
                    }
                } else /* tab */ {
                    if (document.activeElement === lastFocusableEl) {
                        firstFocusableEl.focus();
                        e.preventDefault();
                    }
                }

            });
        }

        var bindClick = function () {
            if ($('.vjs-sharepanel').hasClass("vjs-hidden")) {
                $('.vjs-sharepanel').removeClass('vjs-hidden');
                myPlayer.pause();
                trapFocus($('.vjs-sharepanel-controls')[0], $('#openCopyConfirmPopup')[0]);
            }
            else {
                $('.vjs-sharepanel').addClass('vjs-hidden');
                myPlayer.play();
            }

            if (myPlayer.el_.clientHeight <= 0) {
                // incase the player container height is set to 0, sharePanel will be visible.
                // need to reset the height here.
                myPlayer.el_.style.height = myPlayer.el().clientHeight * 0.9 + "px";
            }
        }

        var bindKeydown = function () {
            if (event.keyCode === 13)
                bindClick();
        }

        var getPredefinedShareIcon = function (shareType, options) {
            var playerBaseUrl = options.playerBaseUrl;
            var returnValue = {};
            var sFile = document.createElement("script");
            sFile.type = "text/javascript";
            var encodedPageUrl = encodeURIComponent(getCurrentPageUrl(options));
            if (playerBaseUrl && playerBaseUrl.length > 0)
                encodedPageUrl = playerBaseUrl;
            switch (shareType) {
                case 0 /* Facebook */:
                    returnValue.iconUrl = "data:image/svg+xml;charset=utf-8,%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20viewBox%3D%220%200%2032%2032%22%20enable-background%3D%22new%200%200%2032%2032%22%20xml%3Aspace%3D%22preserve%22%3E%3Cg%3E%3Cpath%20id%3D%22Blue_3_%22%20fill%3D%22%233B5998%22%20d%3D%22M30.2%2C32c1%2C0%2C1.8-0.8%2C1.8-1.8V1.8c0-1-0.8-1.8-1.8-1.8H1.8C0.8%2C0%2C0%2C0.8%2C0%2C1.8v28.5%2Cc0%2C1%2C0.8%2C1.8%2C1.8%2C1.8H30.2z%22%2F%3E%3Cpath%20id%3D%22f_3_%22%20fill%3D%22%23FFFFFF%22%20d%3D%22M22.1%2C32V19.6h4.2l0.6-4.8h-4.8v-3.1c0-1.4%2C0.4-2.4%2C2.4-2.4l2.6%2C0V5c-0.4-0.1-2-0.2-3.7-0.2%2Cc-3.7%2C0-6.2%2C2.3-6.2%2C6.4v3.6h-4.2v4.8h4.2V32H22.1z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E";
                    returnValue.url = "//www.facebook.com/share.php?u=" + encodedPageUrl;
                    returnValue.shareType = shareType
                    sFile.src = "//connect.facebook.net/en_US/sdk.js";
                    $("head").append(sFile);
                    break;
                case 1 /* Twitter */:
                    returnValue.iconUrl = "data:image/svg+xml;charset=utf-8,%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20viewBox%3D%220%200%2032%2032%22%20enable-background%3D%22new%200%200%2032%2032%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20fill%3D%22%2355ACEE%22%20d%3D%22M32%2C6.4c-1.2%2C0.5-2.4%2C0.9-3.8%2C1c1.4-0.8%2C2.4-2.1%2C2.9-3.6c-1.3%2C0.8-2.7%2C1.3-4.2%2C1.6c-1.2-1.3-2.9-2.1-4.8-2.1%2Cc-3.6%2C0-6.6%2C2.9-6.6%2C6.6c0%2C0.5%2C0.1%2C1%2C0.2%2C1.5C10.3%2C11.1%2C5.5%2C8.5%2C2.2%2C4.5c-0.6%2C1-0.9%2C2.1-0.9%2C3.3c0%2C2.3%2C1.2%2C4.3%2C2.9%2C5.5%2Cc-1.1%2C0-2.1-0.3-3-0.8c0%2C0%2C0%2C0.1%2C0%2C0.1c0%2C3.2%2C2.3%2C5.8%2C5.3%2C6.4c-0.6%2C0.1-1.1%2C0.2-1.7%2C0.2c-0.4%2C0-0.8%2C0-1.2-0.1%2Cc0.8%2C2.6%2C3.3%2C4.5%2C6.1%2C4.6c-2.2%2C1.8-5.1%2C2.8-8.2%2C2.8c-0.5%2C0-1.1%2C0-1.6-0.1c2.9%2C1.9%2C6.4%2C2.9%2C10.1%2C2.9c12.1%2C0%2C18.7-10%2C18.7-18.7%2Cc0-0.3%2C0-0.6%2C0-0.8C30%2C8.9%2C31.1%2C7.7%2C32%2C6.4z%22%2F%3E%3C%2Fsvg%3E";
                    returnValue.url = "//twitter.com/share?url=" + encodedPageUrl + "&text=";
                    returnValue.shareType = shareType
                    sFile.src = "//platform.twitter.com/widgets.js";
                    $("head").append(sFile);
                    break;
                case 2 /* LinkedIn */:
                    returnValue.iconUrl = "data:image/svg+xml;charset=utf-8,%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20viewBox%3D%220%200%2032%2032%22%20enable-background%3D%22new%200%200%2032%2032%22%20xml%3Aspace%3D%22preserve%22%3E%3Cg%3E%3Cpath%20fill%3D%22%230077B5%22%20d%3D%22M29.6%2C0H2.4C1.1%2C0%2C0%2C1%2C0%2C2.3v27.4C0%2C31%2C1.1%2C32%2C2.4%2C32h27.3c1.3%2C0%2C2.4-1%2C2.4-2.3V2.3C32%2C1%2C30.9%2C0%2C29.6%2C0z%22%2F%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M4.7%2C12h4.7v15.3H4.7V12z%20M7.1%2C4.4c1.5%2C0%2C2.8%2C1.2%2C2.8%2C2.8c0%2C1.5-1.2%2C2.8-2.8%2C2.8c-1.5%2C0-2.8-1.2-2.8-2.8%2CC4.4%2C5.6%2C5.6%2C4.4%2C7.1%2C4.4%22%2F%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M12.5%2C12H17v2.1h0.1c0.6-1.2%2C2.2-2.5%2C4.5-2.5c4.8%2C0%2C5.7%2C3.2%2C5.7%2C7.3v8.4h-4.7v-7.4c0-1.8%2C0-4-2.5-4%2Cc-2.5%2C0-2.8%2C1.9-2.8%2C3.9v7.6h-4.7V12z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E";
                    returnValue.url = "//www.linkedin.com/shareArticle?mini=true&url=" + encodedPageUrl + "&title=&summary=&source=";
                    returnValue.shareType = shareType
                    sFile.src = "//platform.linkedin.com/in.js";
                    $("head").append(sFile);
                    break;
                case 3 /* Mail */:
                    returnValue.iconUrl = "data:image/svg+xml;charset=utf-8,%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20width%3D%2232px%22%20height%3D%2232px%22%20viewBox%3D%220%200%2032%2032%22%20style%3D%22enable-background%3Anew%200%200%2032%2032%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cg%3E%3Cpath%20class%3D%22st0%22%20fill%3D%22%23FFFFFF%22%20d%3D%22M0%2C6h32v20H0V6z%20M2%2C24h28V10.125l-14%2C6.984375L2%2C10.125V24z%20M29.765625%2C8H2.234375L16%2C14.890625L29.765625%2C8z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E";
                    returnValue.url = "mailto:?subject=Check out this great video&body=" + encodedPageUrl;
                    returnValue.shareType = shareType
                    break;
                //case 5:  /* Mail */
                //    returnValue.iconUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAACZUlEQVRYR+2XMXLaQBSG/5UzAVfxDeIbBBrPSE2gMJRJThD7BLGbWJwAksbOCUJu4JSSi5AGZtJAbmDfgFQGT8zLLERYFmLfalcwKkzL8vbb9+17+xAo+EcUnA9PgLaGNp7BRmcwAohC36uawG4U8PDzr4ozux+C6CZoefuFA2x2+heA+ADQl8D3TooH2O5fQ4iXM2enevXxYFQowDz0ygNt7A7moVcLsHY+3Hs+vf0hIMaB79Z1NTUVeqPKvivt1nun1bEqpjKDMbgKEX6GLbemA8jpbbQHPSHwmkAjDlIJ2Oz0LwHxRraJaXm3wp02guf0yoOXJrcjWUAEugx97926g68FbLQHXSHwnoA/5OzUslShSm8EIrMsZvc9AbwA0A189zgNMhXQBo7TG4fQgVwBbH7qn4DEuQxk0r84vcksLQ80L1k6Dc68i/iaR4CH7cGRI/B1Dkc4vmq5XZ2iiK/R0bsCqdh3CZgHXBa9upBzQC7NulnMqjcZN+16icVF/Ssb8R4RvoUt90gXaGWDHN7ehwKlMTnP6v8B+XLnoG30xmMnO0huim31SshUxcvGaVnBJtX7qCeu2T+XNmOrV9VBcmnUNnq5DsI8dYtK4t5hU706HURjWFBDmurVgWMH1uW4BVxPS+Vq2rhlonc+bk0nQwD7AH0PfO9t5nFL/mAxsE7kSPQKQC9tojbR+zCw4vddqVxTzZnsf5IIEoRxcqI21bsY+QEOjlXMvR4mermYye/ZDKoCmujdGqCp3q0BbkOv1R3chl4rwKgSQ9+tZNWWZb1VkWTZyHTtE6Bp5qLfFT6D/wDyVA3ZygWNSQAAAABJRU5ErkJggg==";
                //    returnValue.url = encodedPageUrl;
                //    returnValue.shareType = shareType;
                //    returnValue.defaultPlayerUrl = options.defaultPlayerUrl;
                //    break;
            }
            return returnValue;
        };

        var renderSocialIconHtml = function (rtValue) {
            var replacekey = {
                Url: rtValue.url,
                IconUrl: rtValue.iconUrl
            };
            return replaceAll(htmltemplates.socialiconhtml, replacekey);;
        }

        var getCurrentPageUrl = function (options) {
            var qs = (function (a) {
                if (a == "") return {};
                var b = {};
                for (var i = 0; i < a.length; ++i) {
                    var p = a[i].split('=', 2);
                    if (p.length == 1)
                        b[p[0]] = "";
                    else
                        b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
                }
                return b;
            });

            var parentUrl = window.location.href.split("?")[0];
            var videoid = qs(document.location.search.substr(1).split('&'))["id"];
            if (videoid && videoid.length > 0)
                parentUrl += "/" + videoid;
            if (options.playerBaseUrl && options.playerBaseUrl.length > 0)
                parentUrl = options.playerBaseUrl;
            return parentUrl;
        }

        var ClipBoardHelper = (function () {
            function ClipBoardHelper() {
            }
            ClipBoardHelper.tryCopyTextToClipboard = function (textArea, text) {
                textArea.value = text;
                textArea.select();
                var $tempmsg = '';
                try {
                    if (document.execCommand("copy")) {
                        var replacekey = {
                            type: "success",
                            msg: "<strong>Sucess!</strong> Copied to clipboard"
                        };
                        $tempmsg = replaceAll(htmltemplates.alertmsg, replacekey);
                        appendAlertBoxMsg($tempmsg);
                        console.log('copied');
                    }
                    else {
                        var replacekey = {
                            type: "Fail",
                            msg: "<strong>Sucess!</strong> Try again"
                        };
                        $tempmsg = replaceAll(htmltemplates.alertmsg, replacekey);
                        appendAlertBoxMsg($tempmsg);
                        console.log('copy fail');
                    }
                }
                catch (err) {
                    var replacekey = {
                        type: "danger",
                        msg: "<strong>Error!</strong> Try again"
                    };
                    $tempmsg = replaceAll(htmltemplates.alertmsg, replacekey);
                    appendAlertBoxMsg($tempmsg);
                    console.log('error in copying');
                }

            };
            return ClipBoardHelper;
        })();

        var replaceAll = function (str, obj) {
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    obj["{{" + i + "}}"] = obj[i];
                    delete obj[i];
                }
            }
            var rex = new RegExp(Object.keys(obj).join("|"), "gi");

            return str.replace(rex, function (matched) {
                return obj[matched];
            });
        }


        var appendAlertBoxMsg = function (msg) {
            $(".vjs-sharepanel-controls").append(msg);
            setTimeout(function () {
                $("#divalert").remove();
            }, 1500);
        }

    });
}).call(this);