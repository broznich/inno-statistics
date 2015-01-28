var inno = new IframeHelper();

var Settings = function (form) {
    this.form = form;
    
    this.initForm();
};

Settings.prototype = {
    getSettings: function (callback) {
        inno.getProperties(function (status, data) {
            if (status) {
                callback(data);
            } else {
                throw Error("Error requesting data");
            }
        });
    },

    setSettings: function (settings) {
        inno.setProperties(settings, function (status) {
            if (status) {
                alert("Settings was saved successfully!");   
            }
        });
    },

    initForm: function () {
        var self = this;
        this.form.addEventListener("submit", function (e) {
            e.preventDefault();
            
            var elements = e.target.elements;
            
            var settings = {
                "ev_color"  : elements.color.value,
                "ev_prc"    : elements.prc.checked,
                "ev_count"  : elements.count.checked
            };
            
            self.setSettings(settings);
        });
        
        this.getSettings(function (data) {
            var elements = self.form.elements;
            
            elements.color.value = data.hasOwnProperty("ev_color") ? data.ev_color : "blue"; 
            elements.prc.checked = data.hasOwnProperty("ev_prc") ? data.ev_prc : "true";
            elements.count.checked = data.hasOwnProperty("ev_count") ? data.ev_count : "true";
        });
    }
};

document.addEventListener("DOMContentLoaded", function () {
    inno.onReady(function () {
        var form        = document.getElementById("settings-form"),
            settings    = new Settings(form);
    });
});