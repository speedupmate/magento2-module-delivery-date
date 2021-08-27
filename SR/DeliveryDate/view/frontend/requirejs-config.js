var config = {
    config: {
        mixins: {
            'Magento_Checkout/js/view/shipping': {
                'SR_DeliveryDate/js/mixin/shipping-mixin': true
            },
            'Amazon_Payment/js/view/shipping': {
                'SR_DeliveryDate/js/mixin/shipping-mixin': true
            }
        }
    }
};
