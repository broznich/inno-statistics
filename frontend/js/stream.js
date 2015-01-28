var inno = new IframeHelper();

var App = function (config) {
    this.eTpl = "<p class=\"title\">{0}</p><div class=\"progress\"><div class=\"progress-bar {color}\" role=\"progressbar\" aria-valuenow=\"{1}\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: {1}%;\">{2}</div></div>";
    
    this.eCont      = config.eventContainer;
    this.eHeader    = config.eventHeader;
    this.pCont      = config.profileContainer;
    
    this.cache = "";
    this.settings = {};
};

App.prototype = {
    updateView: function (data) {
        var self = this;
        
        try {
            data = JSON.parse(data);   
        } catch (e) {
            data = {};
        }
        
        if (!data.data) {
            return false;
        } else {
            data = data.data;
        }
        
        if (data.events) {
            var max = 0, 
                tpl = "";
            
            data.events.forEach(function (event) {
                max += event.count;   
            });
            
            data.events.forEach(function (event) {
                var prc = Math.round((event.count / max) * 100), xTpl, 
                    text = "";
                
                xTpl = self.eTpl.replace(/\{0\}/g, "Event defenition: " + event.event_id);
                xTpl = xTpl.replace(/\{1\}/g, prc);
                
                text = self.settings.ev_prc ? prc + "%" : "";
                text += self.settings.ev_count ? " [" + event.count + "]" : "";
                
                xTpl = xTpl.replace(/\{2\}/g, text);
                
                tpl += xTpl;
            });
            
            if (max > 0) {
                this.eHeader.textContent = "All events: " + max;
                this.eCont.innerHTML = tpl;
            } else {
                this.eCont.textContent = "No data";   
            }
            
        }
        
        if (data.profiles) {
            var max = 0, 
                tpl = "";
            
            data.profiles.forEach(function (profile) {
                max += profile.count;   
            });
            
            data.profiles.forEach(function (profile) {
                var prc = Math.round((profile.count / max) * 100), xTpl, 
                    text = "";
                xTpl = self.eTpl.replace(/\{0\}/g, "Profile: " + profile.profile_id);
                xTpl = xTpl.replace(/\{1\}/g, prc);
                
                text = self.settings.ev_prc ? prc + "%" : "";
                text += self.settings.ev_count ? " [" + profile.count + "]" : "";
                
                xTpl = xTpl.replace(/\{2\}/g, text);
                
                tpl += xTpl;
            });
            
            if (max > 0) {
                this.pCont.innerHTML = tpl;
            } else {
                this.pCont.textContent = "No data";
            }
            
        }
    },
    
    initData: function () {
        var color = "";
        
        switch (this.settings.ev_color) {
            case "green"    : color = "progress-bar-success"; break;
            case "orange"   : color = "progress-bar-warning"; break;
            case "red"      : color = "progress-bar-danger"; break;
        }
        
        this.eTpl = this.eTpl.replace(/\{color\}/g, color);
    },
    
    requestData: function () {
        var url  = inno.getCurrentApp().url,
            self = this;
        
        var request = new XMLHttpRequest();
        
        request.open("GET", url + "/statistics", true);
        request.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var text = this.responseText;
                if (text !== self.cache) {
                    self.cache = text;
                    self.updateView(text);
                }
            }
        }
        
        request.send(null);
    },
    
    requestSettings: function (callback) {
        var self = this;
        inno.getProperties(function (status, data) {
            if (status) {
                self.settings = data;
                callback(data);
            } else {
                throw Error("Error requesting data");
            }
        });
    },
    
    start: function (callback) {
        var self = this;
        
        this.requestSettings(function () {
            self.initData();
            self.requestData();
            self.updateInterval = window.setInterval(self.requestData.bind(self), 10000);
        });
    },
    
    clear: function () {
        if (this.updateInterval) {
            window.clearInterval(this.updateInterval);
        }   
    }
}

document.addEventListener("DOMContentLoaded", function () {
    var config = {    
        eventContainer      : document.getElementById("eventDef"),
        eventHeader         : document.getElementById("header-eds-all"),
        profileContainer    : document.getElementById("profiles")
    };
    
    var app = new App(config);
 
    inno.onReady(function () {
        app.start();
    });
    
    window.onbeforeunload = function () {
        app.clear();
    };
});