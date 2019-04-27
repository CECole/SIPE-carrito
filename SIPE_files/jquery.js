(function ($) {
	var numericRegex = /^(\d+)$/,
		alphabeticRegex = /^([a-zA-Z]+)$/,
		rfcFisica = /^(([A-Za-zÑ&\.\-/]{4})(\d{6})([A-Za-z0-9Ñ]{3})?)$/,
		rfcMoral = /^(([A-Za-zÑ&\.\-/]{3})(\d{6})([A-Za-z0-9Ñ]{3}))$/;

	function validateDate(value) {
		var yyyy = parseInt('19' + value.substr(0, 2), 10);
		var mm = parseInt(value.substr(2, 2), 10) - 1;
		var dd = parseInt(value.substr(4, 2), 10);

		var date = new Date(yyyy, mm, dd);
		return dd === date.getDate() && mm === date.getMonth() && yyyy === date.getFullYear();
	}

	function validarRfcFisica(rfc) {
		if (rfcFisica.test(rfc)) {
			var value = rfc.substr(4, 6);
			return validateDate(value);
		}
		return false;
	}

	function validarRfcMoral(rfc) {
		if (rfcMoral.test(rfc)) {
			var value = rfc.substr(3, 6);
			return validateDate(value);
		}
		return false;
	}

	function checkPassword(password) {
		var range = function (start, count) { return ko.utils.range(start, start + (count - 1)) },
			toChar = function (value) { return String.fromCharCode(value); };

		if (typeof password === 'string' && password.hasValue()) {
			for (var i = 0; (i + 3) <= password.length; i++) {
				var group = password.substr(i, 3);
				if (numericRegex.test(group) || alphabeticRegex.test(group)) {
					var sequence = range(group.charCodeAt(0), 3).map(toChar).join(''),
						reverse = range(group.charCodeAt(group.length - 1), 3).map(toChar).reverse().join('');
					if (group === sequence || group === reverse) {
						return false;
					}
				}
			}
		}
		return true;
	}

	function setValidationValues(options, ruleName, value, message) {
		options.rules[ruleName] = value;
		if (options.message || message) {
			options.messages[ruleName] = options.message || message;
		}
	}

	function getModelPrefix(fieldName) {
		return fieldName.substr(0, fieldName.lastIndexOf(".") + 1);
	}

	function appendModelPrefix(value, prefix) {
		if (value.indexOf("*.") === 0) {
			value = value.replace("*.", prefix);
		}
		return value;
	}

	function escapeAttributeValue(value) {
		return value.replace(/([!"#$%&'()*+,./:;<=>?@\[\\\]^`{|}~])/g, "\\$1");
	}

	// Older "accept" file extension method. Old docs: http://docs.jquery.com/Plugins/Validation/Methods/accept
	$.validator.addMethod('accept', function (value, element, param) {
		param = typeof param === 'string' ? param.replace(/,/g, '|').replace(/\s/g, '') : 'png|jpe?g|gif';
		return this.optional(element) || value.match(new RegExp('\\.(' + param + ')$', 'i'));
	}, $.validator.format('Please enter a value with a valid extension.'));

	$.validator.addMethod("nonequalto", function (value, element, param) {
		return this.optional(element) || (value || '').toLowerCase() != ($(param).val() || '').toLowerCase();
	}, $.validator.format("Please enter a different value."));

	$.validator.addMethod("oneletteronenumber", function (value, element, param) {
		return this.optional(element) || /^(?=.*[a-zA-Z])(?=.*\d).+$/.test(value);
	}, $.validator.format("At least one number and one letter."));

	$.validator.addMethod("password2", function (value, element, param) {
		return this.optional(element) || /^((.)\2?(?!\2))+$/.test(value);
	}, $.validator.format("No more than three consecutive repeating characters."));

	$.validator.addMethod("password3", function (value, element, param) {
		return this.optional(element) || checkPassword(value);
	}, $.validator.format("No more than three consecutive characters."));

	$.validator.addMethod("nonempty", function (value, element, param) {
		var length = value.trim().length;
		if (this.optional(element) && length <= 0) {
			return true;
		}
		return length > 0;
	}, $.validator.format("This field is required."));

	$.validator.addMethod("fisicarfc", function (value, element, param) {
		return this.optional(element) || validarRfcFisica(value);
	}, $.validator.format("This field is invalid."));

	$.validator.addMethod("moralrfc", function (value, element, param) {
		return this.optional(element) || validarRfcMoral(value);
	}, $.validator.format("This field is invalid."));

	$.validator.unobtrusive.adapters.add('nonequalto', ['other'], function (options) {
		var prefix = getModelPrefix(options.element.name),
			other = options.params.other,
			fullOtherName = appendModelPrefix(other, prefix),
			element = $(options.form).find(':input[name="' + escapeAttributeValue(fullOtherName) + '"]')[0];

		setValidationValues(options, 'nonequalto', element);
	});

	$.validator.unobtrusive.adapters.add('oneletteronenumber', [], function (options) {
		setValidationValues(options, "oneletteronenumber", '');
	});

	$.validator.unobtrusive.adapters.add('nonempty', [], function (options) {
		setValidationValues(options, "nonempty", '');
	});

	$.validator.unobtrusive.adapters.add('fisicarfc', [], function (options) {
		setValidationValues(options, "fisicarfc", '');
	});

	$.validator.unobtrusive.adapters.add('moralrfc', [], function (options) {
		setValidationValues(options, "moralrfc", '');
	});

	$.validator.unobtrusive.adapters.add('validpassword', ['password1message', 'password2message', 'password3message'], function (options) {
		setValidationValues(options, "password2", '', options.params.password2message);
		setValidationValues(options, "password3", '', options.params.password3message);
	});
})(jQuery);