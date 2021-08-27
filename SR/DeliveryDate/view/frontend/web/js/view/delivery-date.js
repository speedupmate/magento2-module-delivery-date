define([
    'jquery',
    'ko',
    'underscore',
    'uiRegistry',
    'Magento_Ui/js/form/element/abstract',
    'mage/calendar'
], function ($, ko, _, uiRegistry, Component) {
    'use strict';

    return Component.extend({
        initialize: function () {
            this._super();

            //listen what ajax calls are sent
            this.addPayloadListener();

            var disabled = window.checkoutConfig.shipping.delivery_date.disabled;
            var noday = window.checkoutConfig.shipping.delivery_date.noday;
            var hourMin = parseInt(window.checkoutConfig.shipping.delivery_date.hourMin);
            var hourMax = parseInt(window.checkoutConfig.shipping.delivery_date.hourMax);
            var format = window.checkoutConfig.shipping.delivery_date.format;

            if(!format) {
                format = 'yy-mm-dd';
            }
            var disabledDay = disabled.split(",").map(function(item) {
                return parseInt(item, 10);
            });

            ko.bindingHandlers.datetimepicker = {
                init: function (element, valueAccessor, allBindingsAccessor) {
                    var $el = $(element);
                    //initialize datetimepicker
                    if(noday) {
                        var options = {
                            minDate: 0,
                            dateFormat:format,
                            hourMin: hourMin,
                            hourMax: hourMax
                        };
                    } else {
                        var options = {
                            minDate: 0,
                            dateFormat:format,
                            hourMin: hourMin,
                            hourMax: hourMax,
                            beforeShowDay: function(date) {
                                var day = date.getDay();
                                if(disabledDay.indexOf(day) > -1) {
                                    return [false];
                                } else {
                                    return [true];
                                }
                            }
                        };
                    }

                    $el.datetimepicker(options);

                    var writable = valueAccessor();
                    if (!ko.isObservable(writable)) {
                        var propWriters = allBindingsAccessor()._ko_property_writers;
                        if (propWriters && propWriters.datetimepicker) {
                            writable = propWriters.datetimepicker;
                        } else {
                            return;
                        }
                    }
                    writable($(element).datetimepicker("getDate"));
                },
                update: function (element, valueAccessor) {
                    var widget = $(element).data("DateTimePicker");
                    //when the view model is updated, update the widget
                    if (widget) {
                        var date = ko.utils.unwrapObservable(valueAccessor());
                        widget.date(date);
                    }
                }
            };

            return this;
        },

        addPayloadListener: function() {
            $.ajaxPrefilter(
                function ( options, localOptions, jqXHR ) {
                    this.addPayload(options, localOptions, jqXHR);
                }.bind(this)
            );
        },

        addPayload: function(options, localOptions, jqXHR) {

                //we target following urls
                var allowed  = ["checkout/onepage/update", "rest/"];
                //methods
                var methods = ["post","delete","put"];

                var matches = _.filter(
                    allowed,
                    function (seek) {
                        return options.url.indexOf(seek) !== -1;
                    }
                );

                //urls that interest us + methods matched
                if (matches.length > 0 && methods.indexOf(options.type.toLowerCase()) >= 0) {

                    //keys in payload that interest us
                    var payloads  = ["addressInformation","billingAddress","shippingAddress"];
                    var payloadMatches = _.filter(
                        payloads,
                        function (seek) {
                            return options.data.indexOf(seek) !== -1;
                        }
                    );

                    //elements/values we seek
                    var componentName = "checkout.steps.shipping-step.shippingAddress.shippingAdditional.delivery_date.form-fields";

                    //if we have those elemnent/values
                    uiRegistry.async(componentName)(
                        function (form) {

                            var newData = {};
                            var existingData = {};

                            //data object created
                            _.each(form.elems(),
                                function(elem){
                                    newData[elem.index] = (_.isUndefined(elem.value())) ? "" : elem.value();
                                }.bind(this)
                            );

                            //if we have payloadmatches and new data
                            if(!_.isEmpty(payloadMatches) && !_.isEmpty(newData)) {

                                if (_.isString(options.data)) {
                                //see if this is a json string
                                    try {
                                        existingData = JSON.parse(options.data);
                                    } catch (e) {
                                        //empty strings, not suitable etc
                                    }
                                } else {
                                    existingData = localOptions.data;
                                }

                                //for each key we found
                                _.each(payloadMatches,
                                    function(value) {
                                        //merge in our new params
                                        existingData[value]['extension_attributes'] = this.mergeJson(_.clone(newData), existingData[value]['extension_attributes']);
                                    }.bind(this)
                                );
                                //commit back to data
                                options.data = JSON.stringify(existingData);
                            }

                        }.bind(this)
                    );

                }
        },

        mergeJson: function (target, add) {
            for (var key in add) {
                if (add.hasOwnProperty(key)) {
                    if (!_.isUndefined(target[key]) && target[key] && _.isObject(target[key]) && _.isObject(add[key])) {
                        this.mergeJson(target[key], add[key]);
                    } else if (_.isUndefined(target[key]) || _.isNull(target[key])) {
                        target[key] = add[key];
                    }
                }
            }
            return target;
        }
    });
});
