/* =========================================================
 * bootstrap-pincode-input.js
 *
 * =========================================================
 * Created by Ferry Kranenburg
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

; (function ($, window, document, undefined) {

	"use strict";

	// Create the defaults once
	var pluginName = "pincodeInput";
	var defaults = {
		placeholders: undefined, // seperate with a " "(space) to set an placeholder for each input box
		inputs: 4,									    // 4 input boxes = code of 4 digits long
		hidedigits: true,								// hide digits
		change: function (input, value, inputnumber) {		// callback on every input on change (keyup event)
			//input = the input textbox DOM element
			//value = the value entered by user (or removed)
			//inputnumber = the position of the input box
		},
		complete: function (value, e, errorElement) {	// callback when all inputs are filled in (keyup event)
			//value = the entered code
			//e = last keyup event
			//errorElement = error span next to to this, fill with html e.g. : $(errorElement).html("Code not correct");
		}
	};

	// The actual plugin constructor
	function Plugin(element, options) {
		this.element = element;
		this.settings = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	// Avoid Plugin.prototype conflicts
	$.extend(Plugin.prototype, {
		init: function () {
			this.buildInputBoxes();

		},
		updateOriginalInput: function () {
			var newValue = "";
			$('.pincode-input-text', this._container).each(function (index, value) {
				newValue += $(value).val().toString();
			});
			$(this.element).val(newValue);
		},
		check: function () {
			var isComplete = true;
			var code = "";
			$('.pincode-input-text', this._container).each(function (index, value) {
				code += $(value).val().toString();
				if (!$(value).val()) {
					isComplete = false;
				}
			});

			return isComplete;


		},
		buildInputBoxes: function () {
			this._container = $('<div />').addClass('pincode-input-container');

			var currentValue = [];
			var placeholders = [];

			if (this.settings.placeholders) {
				placeholders = this.settings.placeholders.split(" ");
			}

			// If we do not hide digits, we need to include the current value of the input box
			// This will only work if the current value is not longer than the number of input boxes.
			if (this.settings.hidedigits == false && $(this.element).val() != "") {
				currentValue = $(this.element).val().split("");
			}

			// make sure this is the first password field here
			if (this.settings.hidedigits) {
				this._pwcontainer = $('<div />').css("display", "none").appendTo(this._container);
				this._pwfield = $('<input>').attr({ 'type': 'password', 'pattern': "[0-9]*", 'inputmode': "numeric", 'autocomplete': 'off' }).appendTo(this._pwcontainer);
			}

			// for desktop mode we build one input for each digit
			for (var i = 0; i < this.settings.inputs; i++) {

				var input = $('<input>').attr({ 'type': 'text', 'maxlength': "1", 'autocomplete': 'off', 'placeholder': (placeholders[i] ? placeholders[i] : undefined) }).addClass('form-control pincode-input-text').appendTo(this._container);
				if (this.settings.hidedigits) {
					// hide digits
					input.attr('type', 'password');
				} else {
					// show digits, also include default value
					input.val(currentValue[i]);
				}

				if (i == 0) {
					input.addClass('first');
				} else if (i == (this.settings.inputs - 1)) {
					input.addClass('last');
				} else {
					input.addClass('mid');
				}

				// add events
				this._addEventsToInput(input, (i + 1));
			}



			// error box
			this._error = $('<div />').addClass('text-danger pincode-input-error').appendTo(this._container);

			//hide original element and place this before it
			$(this.element).css("display", "none");
			this._container.insertBefore(this.element);
		},
		enable: function () {
			$('.pincode-input-text', this._container).each(function (index, value) {
				$(value).prop('disabled', false);
			});
		},
		disable: function () {
			$('.pincode-input-text', this._container).each(function (index, value) {
				$(value).prop('disabled', true);
			});
		},
		focus: function () {
			$('.pincode-input-text', this._container).first().select().focus();
		},
		clear: function () {
			$('.pincode-input-text', this._container).each(function (index, value) {
				$(value).val("");
			});
			this.updateOriginalInput();
		},
		destroy: function () {
			$(this.element).css("display", "");
			this._container.remove();
		},
		_addEventsToInput: function (input, inputnumber) {

			input.on('focus', function (e) {
				this.select();  //automatically select current value
			});

			input.on('keydown', $.proxy(function (e) {
				if (this._pwfield) {
					// Because we need to prevent password saving by browser
					// remove the value here and change the type!
					// we do this every time the user types
					$(this._pwfield).attr({ 'type': 'text' });
					$(this._pwfield).val("");
				}


				// in desktop mode, check if a number was entered
				var $input = $(e.currentTarget);
				if (e.keyCode == 8) {
					// backspace 
					e.preventDefault();
					e.stopPropagation();
					$input.val("").prev().focus();
				} else if (e.keyCode == 32) {
					// space
					e.preventDefault();
					e.stopPropagation();
					$input.val("").next().focus();
				} else if (e.keyCode == 37) {
					// left arrow
					e.preventDefault();
					e.stopPropagation();
					$input.prev().focus();
				} else if (e.keyCode == 39) {
					// right arrow
					e.preventDefault();
					e.stopPropagation();
					$input.next().focus();
				} else if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
					// digit
					e.preventDefault();
					e.stopPropagation();
					$input.val(String.fromCharCode(e.keyCode)).next().focus();
				} else if (!(e.keyCode == 9							// tab key
					|| e.keyCode == 46                          // delete key
					|| (e.ctrlKey && e.keyCode == 67) // ctrl+c
					|| (e.ctrlKey && e.keyCode == 86) // ctrl+v
					|| (e.ctrlKey && e.keyCode == 88))) { // ctrl+x
					e.preventDefault();     				// prevent character input
					e.stopPropagation();
				}


			}, this));

			input.on('keyup', $.proxy(function (e) {

				// after every keystroke we check if all inputs have a value, if yes we call complete callback

				// update original input box
				this.updateOriginalInput();

				// oncomplete check
				if (this.check()) {
					this.settings.complete($(this.element).val(), e, this._error);
				}

				//onchange event for each input
				if (this.settings.change) {
					this.settings.change(e.currentTarget, $(e.currentTarget).val(), inputnumber);
				}


			}, this));
		}


	});

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[pluginName] = function (options) {
		return this.each(function () {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName, new Plugin(this, options));
			}
		});
	};

})(jQuery, window, document);
