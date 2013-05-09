/*!
* Fancyform - jQuery Plugin
* Simple and fancy form styling alternative
*
* Examples and documentation at: http://www.lutrasoft.nl/jQuery/fancyform/
* 
* Copyright (c) 2010-2013 - Lutrasoft
* 
* Version: 1.3.4.1
* Requires: jQuery v1.6.1+ 
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*/
(function ($) {
    $.simpleEllipsis = function (totalTxt, maxchars) {
        return totalTxt.length < maxchars ? totalTxt : totalTxt.substring(0, maxchars) + "...";
    }

    $.isTouchDevice = function () {
        return !!('ontouchstart' in window);
    };

    $.fn.extend({
        /*
        Get the caret on an textarea
        */
        caret: function (start, end) {
            var elem = this[0], val = this.val(), r, re, rc;

            if (elem) {
                // get caret range
                if (typeof start == "undefined") {
                    if (elem.selectionStart) {
                        start = elem.selectionStart;
                        end = elem.selectionEnd;
                    }
                    // <= IE 8
                    else if (document.selection) {
                        this.focus();

                        r = document.selection.createRange();
                        if (r == null) {
                            return { start: 0, end: e.value.length, length: 0 }
                        }

                        re = elem.createTextRange();
                        rc = re.duplicate();

                        re.moveToBookmark(r.getBookmark());
                        rc.setEndPoint('EndToStart', re);

                        // IE counts a line (not \n or \r) as 1 extra character
                        return { start: rc.text.length - (rc.text.split("\n").length + 1) + 2, end: rc.text.length + r.text.length - (rc.text.split("\n").length + 1) + 2, length: r.text.length, text: r.text };
                    }
                }
                // set caret range
                else {
                    if (typeof start != "number") start = -1;
                    if (typeof end != "number") end = -1;
                    if (start < 0) start = 0;
                    if (end > val.length) end = val.length;
                    if (end < start) end = start;
                    if (start > end) start = end;

                    elem.focus();

                    if (elem.selectionStart) {
                        elem.selectionStart = start;
                        elem.selectionEnd = end;
                    }
                    else if (document.selection) {
                        r = elem.createTextRange();
                        r.collapse(true);
                        r.moveStart("character", start);
                        r.moveEnd("character", end - start);
                        r.select();
                    }
                }

                return { start: start, end: end };
            }
        },
        insertAtCaret: function (myValue) {
            return this.each(function (i) {
                if (document.selection) {
                    //For browsers like Internet Explorer
                    this.focus();
                    sel = document.selection.createRange();
                    sel.text = myValue;
                    this.focus();
                }
                else if (this.selectionStart || this.selectionStart == '0') {
                    //For browsers like Firefox and Webkit based
                    var startPos = this.selectionStart,
						endPos = this.selectionEnd,
						scrollTop = this.scrollTop;
                    this.value = this.value.substring(0, startPos) + myValue + this.value.substring(endPos, this.value.length);
                    this.focus();
                    this.selectionStart = startPos + myValue.length;
                    this.selectionEnd = startPos + myValue.length;
                    this.scrollTop = scrollTop;
                } else {
                    this.value += myValue;
                    this.focus();
                }
            })
        },

        /*
        Replace radio buttons with images
        */
        transformRadio: function (options) {

            var defaults = {
                checked: "",
                unchecked: "",
                disabledChecked: "",
                disabledUnchecked: "",
                trigger: "self" // Can be self or parent
            };

            var options = $.extend(defaults, options);

            var method = {
                imageClick: function () {
                    var name = $(this).prev().attr("name"),
                        input = $(this).prev();

                    if (!input.is(":disabled")) {
                        $("input[name='" + name + "']").prop("checked", false).each(function () {
                            method.setImage.call(this);
                        });

                        input
                            .prop("checked", true)
                            .change();

                        method.setImage.call(input);
                    }
                },
                setImage: function () {
                    var options = $(this).data("options");

                    if (!$(this).next().is("img")) {
                        $(this).after("<img />");
                    }

                    $(this).next("img")
								.attr("src", options[
									$(this).is(":checked") ?
									($(this).is(":disabled") ? "disabledChecked" : "checked") :
									($(this).is(":disabled") ? "disabledUnchecked" : "unchecked")
								]);
                }
            };

            return this.each(function () {
                var _this = $(this);

                // Is already initialized
                if ($(this).data("transformRadio.initialized") === true) {
                    return this;
                }

                // set initialized
                // Radio hide
                $(this)
                    .data("transformRadio.initialized", true)
                    .hide()
                    .data("options", options);

                method.setImage.call(this);

                switch (options.trigger) {
                    case "parent":
                        $(this).parent().click(function () {
                            method.imageClick.call(_this.nextAll("img:first"));
                        });
                        break;
                    case "self":
                        $(this).nextAll("img:first").click(method.imageClick);
                        break;
                }
            });
        },
        /*
        Replace checkboxes with images
        */
        transformCheckbox: function (settings) {

            var defaults = {
                checked: "",
                unchecked: "",
                disabledChecked: "",
                disabledUnchecked: "",
                tristateHalfChecked: "",
                changeHandler: function (is_checked) { },
                trigger: "self", // Can be self, parent
                tristate: false
            };

            var options = $.extend(defaults, settings);

            var method = {
                // Handling the image
                setImage: function () {
                    var checkbox = $(this),
						img = $(this).next(),
						settings = $(this).data('settings'),
						src;

                    if (checkbox.is(":disabled")) {
                        src = checkbox.is(":checked") ? "disabledChecked" : "disabledUnchecked";
                    }
                    else if (checkbox.hasClass("half-checked")) // Tri-state image
                    {
                        src = "tristateHalfChecked";
                    }
                    else if (checkbox.is(":checked")) {
                        src = "checked";
                    }
                    else {
                        src = "unchecked";
                    }
                    img.attr("src", settings[src]);
                },
                setProp: function (el, name, bool) {
                    $(el).prop(name, bool).change();
                    method.setImage.call(el);
                },
                // Handling the check/uncheck/disable/enable functions
                uncheck: function () {
                    method.setProp(this, "checked", false);
                },
                check: function () {
                    method.setProp(this, "checked", true);
                },
                disable: function () {
                    method.setProp(this, "disabled", true);
                },
                enable: function () {
                    method.setProp(this, "disabled", false);
                },
                // Clicking the image
                imageClick: function () {
                    var prev = $(this).prev();
                    if (prev.is(":disabled")) {
                        return;
                    }
                    else if (prev.is(":checked")) {
                        method.uncheck.call(prev);
                        options.changeHandler.call(prev, true);
                    }
                    else {
                        method.check.call(prev);
                        options.changeHandler.call(prev, false);
                    }
                    method.handleTriState.call(prev);
                },
                // Tristate
                handleTriState: function () {
                    var checkbox = $(this),
						settings = $(this).data('settings'),
						li = checkbox.parent(),
						ul = li.find("ul");

                    if (!settings.tristate) return;

                    // Fix children
                    if (checkbox.hasClass("half-checked") || checkbox.is(":checked")) {
                        checkbox.removeClass("half-checked");
                        method.check.call(checkbox);
                        ul.find("input:checkbox").each(method.check);
                    }
                    else if (checkbox.not(":checked")) {
                        checkbox.removeClass("half-checked");
                        ul.find("input:checkbox").each(method.uncheck);
                    }
                    method.setImage.call(checkbox);

                    // Fix parents
                    if (checkbox.parent().parent().parent().is("li")) {
                        method.handleTriStateLevel.call(checkbox.parent().parent().parent());
                    }

                    $(this).trigger("transformCheckbox.tristate");
                },
                // Handle all including parent levels
                handleTriStateLevel: function () {
                    var firstCheckbox = $(this).find("input:checkbox").first(),
						ul = $(this).find("ul"),
						inputs = ul.find("input:checkbox"),
						checked = inputs.filter(":checked");

                    firstCheckbox.removeClass("half-checked");

                    if (inputs.length == checked.length) {
                        method.check.call(firstCheckbox);
                    }
                    else if (checked.length) {
                        firstCheckbox.addClass("half-checked");
                    }
                    else {
                        method.uncheck.call(firstCheckbox);
                    }
                    method.setImage.call(firstCheckbox);

                    if ($(this).parent().parent().is("li")) {
                        method.handleTriStateLevel.call($(this).parent().parent());
                    }
                }
            }

            return this.each(function () {
                if (typeof settings == "string") {
                    method[settings].call(this);
                }
                else {
                    var _this = $(this);

                    // Is already initialized
                    if ($(this).data("transformCheckbox.initialized") === true) {
                        return this;
                    }

                    // set initialized
                    $(this).data("transformCheckbox.initialized", true)
                           .data("settings", options);

                    // Radio hide
                    $(this).hide();

                    // Afbeelding
                    $(this).after("<img src='' />");
                    method.setImage.call(this);

                    switch (options.trigger) {
                        case "parent":
                            $(this).parent().click(function () {
                                method.imageClick.call(_this.nextAll("img:first"));
                            });
                            break;
                        case "self":
                            $(this).next("img:first").click(method.imageClick);
                            break;
                    }
                }
            });
        },
        /*
        Replace select with list
        =========================
        HTML will look like
        <ul>
        <li><span>Selected value</span>
        <ul>
        <li data-settings='{"alwaysvisible" : true}'><span>Option</span></li>
        <li><span>Option</span></li>
        </ul>
        </li>
        </ul>
        */
        transformSelect: function (opts) {
            var defaults = {
                dropDownClass: "transformSelect",
                showFirstItemInDrop: true,

                acceptManualInput: false,
                useManualInputAsFilter: false,

                subTemplate: function (option) {
                    if ($(this)[0].type == "select-multiple") {

                        return "<span><input type='checkbox' value='" + $(option).val() + "' " + ($(option).is(":selected") ? "checked='checked'" : "") + " name='" + $(this).attr("name").replace("_backup", "") + "' />" + $(option).text() + "</span>";
                    }
                    else {
                        return "<span>" + $(option).text() + "</span>";
                    }
                },
                initValue: function () { return $(this).text(); },
                valueTemplate: function () { return $(this).text(); },

                ellipsisLength: null,
                addDropdownToBody: false
            };

            var options = $(this).data("settings");

            var method = {
                init: function () {
                    // Hide mezelf
                    $(this).hide();

                    // Generate HTML
                    var selectedIndex = -1,
                        selectedOption = null,
                        _this = this;

                    if ($(this).find("option:selected").length > 0 && $(this)[0].type != "select-multiple") {
                        selectedOption = $(this).find("option:selected");
                        selectedIndex = $(this).find("option").index(selectedOption);
                    }
                    else {
                        selectedIndex = 0;
                        selectedOption = $(this).find("option:first");
                    }

                    // Maak een ul aan
                    var ul = "<ul class='" + options.dropDownClass + " trans-element'><li>";

                    if (options.acceptManualInput && !$.isTouchDevice()) {
                        var value = $(this).data("value") ? $(this).data("value") : options.initValue.call(selectedOption);
                        ul += "<ins></ins><input type='text' name='" + $(this).attr("name").replace("_backup", "") + "' value='" + value + "' />";

                        // Save old select
                        if ($(this).attr("name").indexOf("_backup") == -1) {
                            $(this).attr("name", $(this).attr("name") + "_backup");
                        }
                    }
                    else {
                        if (options.ellipsisLength) {
                            ul += "<span title=\"" + selectedOption.text() + "\">" + $.simpleEllipsis(options.initValue.call(selectedOption), options.ellipsisLength) + "</span>";
                        }
                        else {
                            ul += "<span>" + options.initValue.call(selectedOption) + "</span>";
                        }
                    }

                    ul += "<ul style='display: none;'>";

                    $(this).children().each(function (i) {
                        if (!i && !options.showFirstItemInDrop) {
                            // Don't do anything when you don't wanna show the first element
                        }
                        else {
                            ul += method[
								$(this)[0].tagName == "OPTION" ? "getLIOptionChild" : "getLIOptgroupChildren"
							].call(_this, this);
                        }
                    });

                    ul += "</ul></li></ul>";

                    var $ul = $(ul),
						$lis = $ul.find("ul li:not(.group)"),
						$inp = $ul.find("input");
                    $(this).after($ul);

                    // Bind handlers
                    if ($(this).is(":disabled")) {
                        method.disabled.call(this, true);
                    }

                    if ($(this)[0].type == "select-multiple" && !$.isTouchDevice()) {
                        if ($(this).attr("name") && $(this).attr("name").indexOf("_backup") == -1) {
                            $(this).attr("name", $(this).attr("name") + "_backup");
                        }
                        $lis.click(method.selectCheckbox);
                    }
                    else {
                        $lis.click(method.selectNewValue);

                        $inp.click(method.openDrop)
                    				.keydown(function (e) {
                    				    var ar = [9, 13]; // Tab or enter
                    				    if ($.inArray(e.which, ar) != -1)
                    				        method.closeAllDropdowns();
                    				})
                                    .prev("ins")
                                    .click(method.openDrop);
                    }

                    if (options.useManualInputAsFilter) {
                        $inp.keyup(method.filterByInput);
                    }

                    $ul.find("span").eq(0).click(method.openDrop);

                    // Set data if we use addDropdownToBody option
                    $ul.find("ul:first").data("trans-element", $ul).addClass("transformSelectDropdown");
                    $ul.data("trans-element-drop", $ul.find("ul:first"));

                    if (options.addDropdownToBody) {
                        $ul.find("ul:first").appendTo("body");
                    }

                    // Check if there is already an event
                    $("html").unbind("click.transformSelect").bind("click.transformSelect", method.closeDropDowns)                    // Bind hotkeys

                    if ($.hotkeys && !$("body").data("trans-element-select")) {
                        $("body").data("trans-element-select", true);

                        $(document)
                            .bind("keydown", "up", function (e) {
                                var ul = $(".trans-focused"), select, selectedIndex;
                                // Only enable on trans-element without input
                                if (!ul.length || ul.find("input").length) return false;
                                select = ul.prevAll("select").first();

                                selectedIndex = select[0].selectedIndex - 1
                                if (selectedIndex < 0) {
                                    selectedIndex = select.find("option").length - 1;
                                }

                                method.selectIndex.call(select, selectedIndex);

                                return false;
                            })
                            .bind("keydown", "down", function (e) {
                                var ul = $(".trans-focused"), select, selectedIndex;
                                // Only enable on trans-element without input
                                if (!ul.length || ul.find("input").length) return false;
                                select = ul.prevAll("select").first();

                                selectedIndex = select[0].selectedIndex + 1
                                if (selectedIndex > select.find("option").length - 1) {
                                    selectedIndex = 0;
                                }

                                method.selectIndex.call(select, selectedIndex);
                                return false;
                            });
                    }

                    // Gebruik native selects
                    if ($.isTouchDevice()) {
                        if (!options.showFirstItemInDrop) {
                            $(this).find("option:first").remove();
                        }
                        $(this)
                            .appendTo($ul.find("li:first"))
                            .show()
                            .css({
                                opacity: 0,
                                position: "absolute",
                                width: "100%",
                                height: "100%",
                                left: 0,
                                top: 0
                            });
                        $ul.find("li:first").css({
                            position: "relative"
                        });
                        $(this).change(method.mobileChange);
                    }
                },
                getUL: function () {
                    return $.isTouchDevice() ? $(this).closest("ul") : $(this).next(".trans-element:first");
                },
                getSelect: function ($ul) {
                    return $.isTouchDevice() ? $ul.find("select") : $ul.prevAll("select:first");
                },
                disabled: function (disabled) {
                    method.getUL.call(this)[disabled ? "addClass" : "removeClass"]("disabled");
                },
                repaint: function () {
                    var ul = method.getUL.call(this);
                    ul.data("trans-element-drop").remove();
                    ul.remove();

                    method.init.call(this);
                },
                filterByInput: function () {
                    var val = $(this).val().toLowerCase(),
                        ul = $(this).closest("ul"),
                        drop = ul.data("trans-element-drop"),
                        li = drop.find("li");

                    // val == ""
                    if (!val) {
                        li.show();
                    }
                    else {
                        li.each(function () {
                            if (!!$(this).data("settings").alwaysvisible) {
                                $(this).show();
                            }
                            else {
                                $(this)[$(this).text().toLowerCase().indexOf(val) == -1 ? "hide" : "show"]();
                            }
                        });
                    }
                },
                selectIndex: function (index) {
                    var select = $(this),
                        ul = method.getUL.call(this),
                        drop = ul.data("trans-element-drop");

                    try {
                        drop.find("li").filter(function () {
                            return $(this).text() == select.find("option").eq(index).text();
                        }).first().trigger("click");
                    }
                    catch (err) { }
                },
                selectValue: function (value) {
                    var select = $(this),
                        ul = method.getUL.call(this),
                        drop = ul.data("trans-element-drop");

                    method.selectIndex.call(this, select.find(value ? "option[value='" + value + "']" : "option:not([value])").index());
                },
                /*
                *	GET option child
                */
                getLIOptionChild: function (option) {
                    var settings = $(option).attr("data-settings");
                    if (!!settings) {
                        settings = "data-settings='" + settings + "'";
                    }
                    if ($(option).hasClass('hideMe')) {
                        settings = settings + " class='hideMe'";
                    }
                    return "<li " + settings + ">" + options.subTemplate.call(this, $(option)) + "</li>";
                },
                /*
                *	GET optgroup children
                */
                getLIOptgroupChildren: function (group) {
                    var _this = this,
						li = "<li class='group'><span>" + $(group).attr("label") + "</span><ul>";

                    $(group).find("option").each(function () {
                        li += method.getLIOptionChild.call(_this, this);
                    });

                    li += "</ul></li>";

                    return li;
                },
                getLIIndex: function (el) {
                    var index = 0, group, sel;
                    if (el.closest(".group").length != 0) {
                        group = el.closest(".group");
                        index = el.closest(".transformSelectDropdown").find("li").index(el) - group.prevAll(".group").length - 1;
                    }
                    else {
                        index = el.parent().find("li").index(el);
                        if (options.showFirstItemInDrop == false) {
                            index += 1;
                        }
                        index -= el.prevAll(".group").length;
                    }
                    return index;
                },
                /*
                *	Select a new value
                */
                selectNewValue: function () {
                    var $drop = $(this).closest(".transformSelectDropdown"),
						$ul = $drop.data("trans-element"),
                        select = method.getSelect($ul),
                        index = method.getLIIndex($(this));

                    select[0].selectedIndex = index;

                    // If it has an input, there is no span used for value holding
                    if ($ul.find("input").length > 0) {
                        $ul.find("input").val(options.valueTemplate.call($(this)));
                    }
                    else {
                        sel = select.find("option:selected");
                        $ul
							.find("span:first")
							.html(
								options.ellipsisLength
								? $.simpleEllipsis(options.valueTemplate.call(sel), options.ellipsisLength)
								: options.valueTemplate.call(sel)
							);
                    }

                    method.closeAllDropdowns();

                    // Trigger onchange
                    select.trigger("change");

                    $(".trans-element").removeClass("trans-focused");
                    $ul.addClass("trans-focused");

                    // Update validator
                    if ($.fn.validate) {
                        select.valid();
                    }
                },
                mobileChange: function () {
                    //var select = $(this),
                    //    $ul = method.getUL.call(this),
                    //	sel = select.find("option:selected");

                    //                    $ul
                    //						.find("span:first")
                    //						.html(
                    //							options.ellipsisLength
                    //							? $.simpleEllipsis(options.valueTemplate.call(sel), options.ellipsisLength)
                    //							: options.valueTemplate.call(sel)
                    //						);
                },
                selectCheckbox: function (e) {
                    var $drop = $(this).closest(".transformSelectDropdown"),
						$ul = $drop.data("trans-element"),
                        select = method.getSelect($ul),
                        t = $(this).closest("li"),
                        checkbox = t.find(":checkbox"),
                        index, group;

                    if ($(e.target).is("li")) {
                        t = $(this);
                    }

                    index = method.getLIIndex(t);

                    if (!$(e.target).is(":checkbox")) {
                        checkbox.prop("checked", !checkbox.is(":checked"));
                    }

                    select.find("option").eq(index).prop("selected", checkbox.is(":checked"));

                    if (checkbox.data("transformCheckbox.initialized") === true) {
                        checkbox.transformCheckbox("setImage");
                    }

                    if (!$(e.target).is(":checkbox")) {
                        checkbox.change();
                    }
                    select.change();
                },
                /*
                *	Open clicked dropdown
                *		and Close all others
                */
                openDrop: function () {
                    var UL = $(this).closest(".trans-element"),
                        childUL = UL.data("trans-element-drop"),
						childLI = $(this).parent();

                    if (UL.hasClass("disabled")) {
                        return false;
                    }

                    // Close on second click
                    if (childLI.hasClass("open") && !$(this).is("input")) {
                        method.closeAllDropdowns();
                    }
                    // Open on first click
                    else {
                        childLI
							.css({ 'z-index': 1200 })
							.addClass("open");

                        childUL.css({ 'z-index': 1200 }).show();

                        method.hideAllOtherDropdowns.call(this);
                    }

                    if (options.addDropdownToBody) {
                        childUL.css({
                            position: "absolute",
                            top: childLI.offset().top + childLI.outerHeight(),
                            left: childLI.offset().left
                        });
                    }
                },
                /*
                *	Hide all elements except this element
                */
                hideAllOtherDropdowns: function () {
                    // Hide elements with the same class
                    var allElements = $("body").find("*"),
						elIndex = allElements.index($(this).parent());

                    $("body").find("ul.trans-element:not(.ignore)").each(function () {
                        var childUL = $(this).data("trans-element-drop");

                        if (elIndex - 1 != allElements.index($(this))) {
                            childUL
                                   .hide()
                                   .css('z-index', 0)
                                        .parent()
                                        .css('z-index', 0)
                                        .removeClass("open");
                        }
                    });
                },
                /*
                *	Close all dropdowns
                */
                closeDropDowns: function (e) {
                    if (!$(e.target).closest(".trans-element").length) {
                        method.closeAllDropdowns();
                    }
                },
                closeAllDropdowns: function () {
                    $("ul.trans-element:not(.ignore)").each(function () {
                        $(this).data("trans-element-drop").hide();
                        $(this).find("li:first").removeClass("open")
                    }).removeClass("trans-focused");
                }
            }

            if (typeof opts == "string") {
                method[opts].apply(this, Array.prototype.slice.call(arguments, 1))
                return this;
            }
            return this.each(function () {
                // Is already initialized
                if (!$(this).data("transformSelect.initialized")) {
                    options = $.extend(defaults, opts);
                    $(this).data("settings", options);

                    // set initialized
                    $(this).data("transformSelect.initialized", true);

                    // Call init functions
                    method.init.call(this);
                }
                return this;
            });
        },
        /*
        Transform a input:file to your own layout
        ============================================
        Basic CSS:
        <style>
        .customInput {
        display: inline-block;
        font-size: 12px;
        }
		
        .customInput .inputPath {
        width: 150px;
        padding: 4px;
        display: inline-block;
        border: 1px solid #ABADB3;
        background-color: #FFF;
        overflow: hidden;
        vertical-align: bottom;
        white-space: nowrap;
        -o-text-overflow: ellipsis;
        text-overflow:    ellipsis;
        }
		
        .customInput .inputButton {
        display: inline-block;
        padding: 4px;
        border: 1px solid #ABADB3;
        background-color: #CCC;
        vertical-align: bottom;
        }        </style>
        */
        transformFile: function (options) {
            var method = {
                file: function (fn, cssClass) {
                    return this.each(function () {
                        var el = $(this),
							holder = $('<div></div>').appendTo(el).css({
							    position: 'absolute',
							    overflow: 'hidden',
							    '-moz-opacity': '0',
							    filter: 'alpha(opacity: 0)',
							    opacity: '0',
							    zoom: '1',
							    width: el.outerWidth() + 'px',
							    height: el.outerHeight() + 'px',
							    'z-index': 1
							}),
							wid = 0,
							inp,
							addInput = function () {
							    var current = inp = holder.html('<input ' + (window.FormData ? 'multiple ' : '') + 'type="file" style="border:none; position:absolute">').find('input');

							    wid = wid || current.width();

							    current.change(function () {
							        current.unbind('change');

							        addInput();
							        fn(current[0]);
							    });
							},
							position = function (e) {
							    holder.offset(el.offset());
							    if (e) {
							        inp.offset({ left: e.pageX - wid + 25, top: e.pageY - 10 });
							        addMouseOver();
							    }
							},
							addMouseOver = function () {
							    el.addClass(cssClass + 'MouseOver');
							},
							removeMouseOver = function () {
							    el.removeClass(cssClass + 'MouseOver');
							};

                        addInput();

                        el.mouseover(position);
                        el.mousemove(position);
                        el.mouseout(removeMouseOver);
                        position();
                    });
                }
            };

            return this.each(function (i) {
                // Is already initialized
                if ($(this).data("transformFile.initialized") === true) {
                    return this;
                }

                // set initialized
                $(this).data("transformFile.initialized", true);

                // 
                var el = $(this).hide(),
					id = null,
					name = el.attr('name'),
					cssClass = (!options ? 'customInput' : (options.cssClass ? options.cssClass : 'customInput')),
					label = (!options ? 'Browse...' : (options.label ? options.label : 'Browse...'));

                if (!el.attr('id')) { el.attr('id', 'custom_input_file_' + (new Date().getTime()) + Math.floor(Math.random() * 100000)); }
                id = el.attr('id');

                el.after('<span id="' + id + '_custom_input" class="' + cssClass + '"><span class="inputPath" id="' + id + '_custom_input_path">&nbsp;</span><span class="inputButton">' + label + '</span></span>');

                method.file.call($('#' + id + '_custom_input'), function (inp) {
                    inp.id = id;
                    inp.name = name;
                    $('#' + id).replaceWith(inp)
							   .removeAttr('style').hide();
                    $('#' + id + '_custom_input_path').html($('#' + id).val().replace(/\\/g, '/').replace(/.*\//, ''));
                }, cssClass);

                return this;
            });

        },
        /*
        Replace a textarea
        */
        transformTextarea: function (options, arg1) {
            var defaults = {
                hiddenTextareaClass: "hiddenTextarea"
            },
				settings = $.extend(defaults, options),

				method = {
				    // Init the module
				    init: function () {
				        // This only happens in IE
				        if ($(this).css("line-height") == "normal") {
				            $(this).css("line-height", "12px");
				        }

				        // Set the CSS
				        var CSS = {
				            'line-height': $(this).css("line-height"),
				            'font-family': $(this).css("font-family"),
				            'font-size': $(this).css("font-size"),
				            "border": "1px solid black",
				            "width": $(this).width(),
				            "letter-spacing": $(this).css("letter-spacing"),
				            "text-indent": $(this).css("text-indent"),
				            "padding": $(this).css("padding"),
				            "overflow": "hidden",
				            "white-space": $(this).css("white-space")
				        };

				        $(this)
				        // Add a new textarea
								.css(CSS)
								.keyup(method.keyup)
								.keydown(method.keyup)
								.bind("mousewheel", method.mousewheel)
				        // Append a div
							.after($("<div />"))
								.next()
								.addClass(settings.hiddenTextareaClass)
								.css(CSS)
								.css("width", $(this).width() - 5)	// Minus 5 because there is some none typeable padding?
								.hide()

				    },

				    // Mousewheel
				    mousewheel: function (e, delta) {
				        e.preventDefault();
				        var lineHeight = $(this).css("line-height");
				        var scrollTo = $(this)[0].scrollTop + (parseFloat(lineHeight) * (delta * -1));
				        method.scrollToPx.call(this, scrollTo);
				    },
				    // Used to scroll 
				    keyup: function (e) {
				        // Check if it has to scroll
				        // Arrow keys down have to scroll down / up (only if to far)
				        /*
				        Keys:
				        37, 38, 39, 40  = Arrow keys (L,U,R,D)
				        13				= Enter
				        */
				        var ignore = [37, 38, 39, 40];
				        if ($.inArray(e.which, ignore) != -1) {
				            method.checkCaretScroll.call(this);
				        }
				        else {
				            method.checkScroll.call(this, e.which);
				        }

				        method.scrollCallBack.call(this);
				    },
				    /*
				    Check cursor position to scroll
				    */
				    checkCaretScroll: function () {
				        var src = $(this);
				        var caretStart = src.caret().start;
				        var textBefore = src.val().substr(0, caretStart);
				        var textAfter = src.val().substr(caretStart, src.val().length);
				        var tar = src.next("." + settings.hiddenTextareaClass);
				        var vScroll = null;

				        // First or last element (don't do anything)
				        if (!caretStart || caretStart == 0) {
				            return false;
				        }

				        // Also pick the first char of a row
				        if (src.val().substr(caretStart - 1, 1) == '\n') {
				            textBefore = src.val().substr(0, caretStart + 1);
				        }

				        method.toDiv.call(this, false, textBefore, textAfter);

				        // If you go through the bottom
				        if (tar.height() > (src.height() + src.scrollTop())) {
				            vScroll = src.scrollTop() + parseInt(src.css("line-height"));
				        }
				        // if you go through the top
				        else if (tar.height() <= src.scrollTop()) {
				            vScroll = src.scrollTop() - parseInt(src.css("line-height"));
				        }

				        // Scroll the px
				        if (vScroll) {
				            method.scrollToPx.call(this,
													vScroll
												);
				        }
				    },

				    // Check the old and new height if it needs to scroll
				    checkScroll: function (key) {
				        // Scroll if needed
				        var src = $(this);
				        var tar = $(this).next("." + settings.hiddenTextareaClass);

				        // Put into the div to check new height
				        var caretStart = src.caret().start;
				        var textBefore = src.val().substr(0, caretStart);
				        var textAfter = src.val().substr(caretStart, src.val().length);

				        method.toDiv.call(this, true, textBefore, textAfter);

				        // If your halfway the scroll, then dont scroll
				        if (
							(src.scrollTop() + src.height()) > tar.height()
						) {
				            return;
				        }

				        // Scroll if needed
				        if (tar.data("old-height") != tar.data("new-height")) {
				            var scrollDiff = tar.data("new-height") - tar.data("old-height");
				            method.scrollToPx.call(this, src.scrollTop() + scrollDiff);
				        }

				    },

				    // Place the value of the textarea into the DIV
				    toDiv: function (setHeight, html, textAfter) {
				        var src = $(this);
				        var tar = $(this).next("." + settings.hiddenTextareaClass);
				        var regEnter = /\n/g;
				        var regSpace = /\s\s/g;
				        var regSingleSpace = /\s/g;
				        var res = src.val();
				        var appendEnter = false;
				        var appendEnterSpace = false;
				        if (html)
				            res = html;

				        // If last key is enter
				        // 		or last key is space, and key before that was enter, then add enter
				        if (regEnter.test(res.substring(res.length - 1, res.length))) {
				            appendEnter = true;
				        }

				        if (
								regEnter.test(res.substring(res.length - 2, res.length - 1)) &&
								regSingleSpace.test(res.substring(res.length - 1, res.length))
							) {
				            appendEnterSpace = true;
				        }

				        // Set old and new height + set the content
				        if (setHeight)
				            tar.data("old-height", tar.height());

				        res = res.replace(regEnter, "<br>"); // No space or it will be replaced by the function below
				        res = res.replace(regSpace, "&nbsp; ");
				        res = res.replace(regSpace, "&nbsp; "); // 2x because 1x can result in: &nbsp;(space)(space) and that is not seen within the div
				        res = res.replace(/<br>/ig, '<br />');
				        tar.html(res);

				        if ((appendEnter || appendEnterSpace) && $.trim(textAfter) == "") {
				            if (appendEnterSpace && $.browser.msie)
				                tar.append("<br />");
				            tar.append("<br />");
				        }

				        if (setHeight) {
				            tar.data("new-height", tar.height());
				        }
				    },

				    // Scroll to a given percentage
				    scrollToPercentage: function (perc) {
				        // Between 0 and 100
				        if (perc >= 0 && perc <= 100) {
				            var src = $(this),
								tar = src.next("." + settings.hiddenTextareaClass),
								maxScroll = parseFloat(src[0].scrollHeight) - src.height(),
								scrollT = maxScroll * perc / 100;

				            // Round on a row
				            method.scrollToPx.call(this, scrollT);
				        }
				    },

				    // Scroll to given PX
				    scrollToPx: function (px) {
				        // Round on a row
				        $(this).scrollTop(method.roundToLineHeight.call(this, px));
				        method.scrollCallBack.call(this);
				    },

				    // Round to line height
				    roundToLineHeight: function (num) {
				        return Math.ceil(num / parseInt($(this).css("line-height"))) * parseInt($(this).css("line-height"));
				    },

				    // Reset to default
				    remove: function () {
				        $(this)
							.unbind("keyup")
							.css({
							    overflow: "auto",
							    border: ""
							})
						.next("div")
							.remove();
				    },
				    scrollCallBack: function () {
				        var maxScroll = parseFloat($(this)[0].scrollHeight) - $(this).height(),
							percentage = (parseFloat($(this)[0].scrollTop) / maxScroll * 100);
				        percentage = percentage > 100 ? 100 : percentage;
				        percentage = percentage < 0 ? 0 : percentage;
				        percentage = isNaN(percentage) ? 100 : percentage;
				        $(this).trigger("scrollToPx", [$(this)[0].scrollTop, percentage]);
				    }
				};

            if (typeof options == "string") {
                method[options].call(this, arg1);
                return this;
            }
            return this.each(function () {
                if (!$(this).next().hasClass(settings.hiddenTextareaClass)) {
                    method.init.call(this);
                    method.toDiv.call(this, true);
                }
            });
        }
    });

})(jQuery);