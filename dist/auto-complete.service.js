import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GlobalRef } from './windowRef.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LocalStorageService } from './storage.service';
import 'rxjs/Rx';
var AutoCompleteSearchService = /** @class */ (function () {
    function AutoCompleteSearchService(_http, platformId, _global, _localStorageService) {
        this._http = _http;
        this.platformId = platformId;
        this._global = _global;
        this._localStorageService = _localStorageService;
    }
    AutoCompleteSearchService.prototype.getPredictions = function (url, query) {
        var _this = this;
        return new Promise(function (resolve) {
            _this._http.get(url, { params: new HttpParams().set("query", query) })
                .subscribe(function (data) {
                if (data) {
                    resolve(data);
                }
                else {
                    resolve(false);
                }
            });
        });
    };
    AutoCompleteSearchService.prototype.getLatLngDetail = function (url, lat, lng) {
        var _this = this;
        return new Promise(function (resolve) {
            _this._http.get(url, { params: new HttpParams().set("lat", lat).set("lng", lng) })
                .subscribe(function (data) {
                if (data) {
                    resolve(data);
                }
                else {
                    resolve(false);
                }
            });
        });
    };
    AutoCompleteSearchService.prototype.getPlaceDetails = function (url, placeId) {
        var _this = this;
        return new Promise(function (resolve) {
            _this._http.get(url, { params: new HttpParams().set("query", placeId) })
                .subscribe(function (data) {
                if (data) {
                    resolve(data);
                }
                else {
                    resolve(false);
                }
            });
        });
    };
    AutoCompleteSearchService.prototype.getGeoCurrentLocation = function () {
        var _this = this;
        return new Promise(function (resolve) {
            if (isPlatformBrowser(_this.platformId)) {
                var _window = _this._global.nativeGlobal;
                if (_window.navigator.geolocation) {
                    _window.navigator.geolocation.getCurrentPosition(function (pos) {
                        var latlng = { lat: parseFloat(pos.coords.latitude + ''), lng: parseFloat(pos.coords.longitude + '') };
                        resolve(latlng);
                    }, function (error) {
                        resolve(false);
                    });
                }
                else {
                    resolve(false);
                }
            }
            else {
                resolve(false);
            }
        });
    };
    AutoCompleteSearchService.prototype.getGeoLatLngDetail = function (latlng) {
        var _this = this;
        return new Promise(function (resolve) {
            if (isPlatformBrowser(_this.platformId)) {
                var _window = _this._global.nativeGlobal;
                var geocoder = new _window.google.maps.Geocoder;
                geocoder.geocode({ 'location': latlng }, function (results, status) {
                    if (status === 'OK') {
                        _this.getGeoPlaceDetail(results[0].place_id).then(function (result) {
                            if (result) {
                                resolve(result);
                            }
                            else {
                                resolve(false);
                            }
                        });
                    }
                    else {
                        resolve(false);
                    }
                });
            }
            else {
                resolve(false);
            }
        });
    };
    AutoCompleteSearchService.prototype.getGeoPrediction = function (params) {
        var _this = this;
        return new Promise(function (resolve) {
            if (isPlatformBrowser(_this.platformId)) {
                var _window = _this._global.nativeGlobal;
                var placesService = new _window.google.maps.places.AutocompleteService();
                var queryInput = {};
                var promiseArr = [];
                if (params.countryRestriction.length) {
                    queryInput = {
                        input: params.query,
                        componentRestrictions: { country: params.countryRestriction },
                    };
                }
                else {
                    queryInput = {
                        input: params.query
                    };
                }
                if (params.geoLocation) {
                    queryInput.location = new _window.google.maps.LatLng(parseFloat(params.geoLocation[0]), parseFloat(params.geoLocation[1]));
                    queryInput.radius = params.radius;
                }
                if (params.geoTypes.length) {
                    for (var i = 0; i < params.geoTypes.length; i++) {
                        var _tempQuery = queryInput;
                        _tempQuery['types'] = new Array(params.geoTypes[i]);
                        promiseArr.push(_this.geoPredictionCall(placesService, _tempQuery));
                    }
                }
                else {
                    promiseArr.push(_this.geoPredictionCall(placesService, queryInput));
                }
                Promise.all(promiseArr).then(function (values) {
                    var val = values;
                    if (val.length > 1) {
                        var _tempArr = [];
                        for (var j = 0; j < val.length; j++) {
                            if (val[j] && val[j].length) {
                                _tempArr = _tempArr.concat(val[j]);
                            }
                        }
                        _tempArr = _this.getUniqueResults(_tempArr);
                        resolve(_tempArr);
                    }
                    else {
                        resolve(values[0]);
                    }
                });
            }
            else {
                resolve(false);
            }
        });
    };
    AutoCompleteSearchService.prototype.getGeoPlaceDetail = function (placeId) {
        var _this = this;
        return new Promise(function (resolve) {
            if (isPlatformBrowser(_this.platformId)) {
                var _window = _this._global.nativeGlobal;
                var placesService = new _window.google.maps.places.PlacesService(document.createElement('div'));
                placesService.getDetails({ 'placeId': placeId }, function (result, status) {
                    if (result == null || result.length === 0) {
                        _this.getGeoPaceDetailByReferance(result.referance).then(function (referanceData) {
                            if (!referanceData) {
                                resolve(false);
                            }
                            else {
                                resolve(referanceData);
                            }
                        });
                    }
                    else {
                        resolve(result);
                    }
                });
            }
            else {
                resolve(false);
            }
        });
    };
    AutoCompleteSearchService.prototype.getGeoPaceDetailByReferance = function (referance) {
        var _this = this;
        return new Promise(function (resolve) {
            if (isPlatformBrowser(_this.platformId)) {
                var _window_1 = _this._global.nativeGlobal;
                var placesService = new _window_1.google.maps.places.PlacesService();
                placesService.getDetails({ 'reference': referance }, function (result, status) {
                    if (status === _window_1.google.maps.places.PlacesServiceStatus.OK) {
                        resolve(result);
                    }
                    else {
                        resolve(false);
                    }
                });
            }
            else {
                resolve(false);
            }
        });
    };
    AutoCompleteSearchService.prototype.addRecentList = function (localStorageName, result, itemSavedLength) {
        var _this = this;
        this.getRecentList(localStorageName).then(function (data) {
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].description === result.description) {
                        data.splice(i, 1);
                        break;
                    }
                }
                data.unshift(result);
                if (data.length > itemSavedLength) {
                    data.pop();
                }
                _this._localStorageService.setItem(localStorageName, JSON.stringify(data));
            }
        });
    };
    AutoCompleteSearchService.prototype.getRecentList = function (localStorageName) {
        var _this = this;
        return new Promise(function (resolve) {
            var value = _this._localStorageService.getItem(localStorageName);
            if (value) {
                value = JSON.parse(value);
            }
            else {
                value = [];
            }
            resolve(value);
        });
    };
    AutoCompleteSearchService.prototype.getUniqueResults = function (arr) {
        return Array.from(arr.reduce(function (m, t) { return m.set(t.place_id, t); }, new Map()).values());
    };
    AutoCompleteSearchService.prototype.geoPredictionCall = function (placesService, queryInput) {
        var _window = this._global.nativeGlobal;
        return new Promise(function (resolve) {
            placesService.getPlacePredictions(queryInput, function (result, status) {
                if (status === _window.google.maps.places.PlacesServiceStatus.OK) {
                    resolve(result);
                }
                else {
                    resolve(false);
                }
            });
        });
    };
    AutoCompleteSearchService.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    AutoCompleteSearchService.ctorParameters = function () { return [
        { type: HttpClient },
        { type: Object, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] },
        { type: GlobalRef },
        { type: LocalStorageService }
    ]; };
    return AutoCompleteSearchService;
}());
export { AutoCompleteSearchService };
//# sourceMappingURL=auto-complete.service.js.map