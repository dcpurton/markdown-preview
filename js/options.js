"use strict";

var storage = chrome.storage.local,
    themePrefix = 'theme_',
    maxCustomCssSize = 8192,
    defaultReloadFreq = 3,
    defaultThemes = ['Clearness', 'ClearnessDark', 'dcpurton', 'Github', 'TopMarks'];

function message(text, type) {
    var msgType = type || 'success',
        msgClass = 'alert-' + msgType;
    $('#msg').html('<div class="alert ' + msgClass + '">' + text + '</div>');
    setTimeout(function() {
        $('div.alert').hide(500);
    }, 3000);
}

// mathjax
storage.get(['mathjax', 'enable_latex_delimiters'], function(items) {
    if(items.mathjax) {
        $('#mathjax').prop('checked', 'checked');
    } else {
        $('#mathjax').removeProp('checked');
    }

    if(items.enable_latex_delimiters) {
        $('#enable-latex-delimiters').prop('checked', 'checked');

        // Automaticaly enable MathJax
        storage.set({'mathjax' :1});
        $('#mathjax').prop('checked', 'checked');

    } else {
        $('#enable-latex-delimiters').removeProp('checked');
    }

});

$('#mathjax').change(function() {
    if($(this).prop('checked')) {
        storage.set({'mathjax' :1});
    } else {
        storage.remove('mathjax');

        // Automatically disable LaTeX delimiters
        storage.remove('enable_latex_delimiters');
        $('#enable-latex-delimiters').removeProp('checked');
    }
});

$('#enable-latex-delimiters').change(function() {
    if($(this).prop('checked')) {
        storage.set({'enable_latex_delimiters' :1});

        // Automatically enable MathJax
        storage.set({'mathjax' :1});
        $('#mathjax').prop('checked', 'checked');
    } else {
        storage.remove('enable_latex_delimiters');
    }
});

// auto-reload
storage.get('auto_reload', function(items) {
    if(items.auto_reload) {
        $('#auto-reload').prop('checked', 'checked');
    } else {
        $('#auto-reload').removeProp('checked');
    }
});

$('#auto-reload').change(function() {
    if($(this).prop('checked')) {
        storage.set({'auto_reload' : 1});
    } else {
        storage.remove('auto_reload');
    }
});

// theme
function getThemes() {
    storage.get(['custom_themes', 'theme'], function(items) {
        if(items.custom_themes) {
            var k, v, themes = items.custom_themes;
            var group = $('<optgroup label="Custom themes"></optgroup>');

            $('#theme optgroup[label="Custom themes"]').empty().remove();
            for(k in themes) {
                v = themes[k];
                group.append($("<option></option>").text(v));
            }
            $('#theme').append(group);
        }

        if(items.theme) {
            $('#theme').val(items.theme);
        }
    });
}

getThemes();
$('#theme').change(function() {
    storage.set({'theme' : $(this).val()}, function() {
        message('You changed the default css.');
    });
});


$('#btn-add-css').click(function() {
    var file = $('#css-file')[0].files[0],
        reader = new FileReader();

    if(!file || (file.type != 'text/css')) {
        message('Oops, support css file only.', 'error');
        return;
    }

    if(file.size > maxCustomCssSize) {
        message('Oops, only support the css file that size less than ' + (maxCustomCssSize / 1024) + '.', 'error');
        return;
    }

    var tmp = file.name.split('.');
    tmp.pop();
    var filename = tmp.join('.');
    reader.onload = function(evt) {
        var fileString = evt.target.result;
        storage.get('custom_themes', function(items) {
            var themes = items.custom_themes;
            if(themes) {
                themes.push(filename);
            } else {
                themes = [filename + ""];
            }
            themes = $.grep(themes, function(v, k) {
                return $.inArray(v, themes) === k;
            });
            var obj = {'custom_themes' : themes};
            obj[themePrefix + filename] = fileString;
            storage.set(obj, function() {
                getThemes();
                message('Well done! You added a custom css.');
                $('#css-file').val('');
            });
        });
    };
    reader.readAsText(file);
});

// file extensions

$('.cont-exts input').change(function() {
    var fileExt = this.value,
        isChecked = this.checked;

    storage.get('exclude_exts', function(items) {
        var exts = items.exclude_exts,
            key = fileExt;

        if(!exts) {
            exts = {};
        }

        if(isChecked) {
            delete exts[key];
        } else {
            exts[key] = 1;
        }

        storage.set({'exclude_exts' : exts});
    });
});

storage.get('reload_freq', function(items) {
    var freq = items.reload_freq;
    freq = freq ? freq : defaultReloadFreq;

    $.each($('#reload-freq option'), function(k, v) {
        if($(v).val() == freq) {
            $(v).prop('selected', 'selected');
        }
    });
});

$('#reload-freq').change(function() {
    storage.set({'reload_freq' : $(this).val()});
});

storage.get('exclude_exts', function(items) {
    var exts = items.exclude_exts;
    if(!exts) {
        return;
    }

    $.each(exts, function(k, v) {
        $('input[value="' + k + '"]').prop('checked', false);
    });
});
