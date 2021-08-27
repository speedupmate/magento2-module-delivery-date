<?php
namespace SR\DeliveryDate\Plugin\Quote\Api;

class AddressExtensionManagement
{

    /**
     *
     * @param \Magento\Checkout\Model\Session $checkoutSession
     */
    public function __construct(
        \Magento\Checkout\Model\Session $checkoutSession
    ) {
        $this->checkoutSession = $checkoutSession;
    }

    /**
     *
     * @param int $cartId
     * @param object $extAttributes
     */
    public function afterSetDeliveryDate(
        $parent,
        $value
    ) {
        $quote = $this->checkoutSession->getQuote();
        $value = ($parent->getDeliveryDate()) ? $parent->getDeliveryDate() : "" ;
        $quote->setDeliveryDate($value);
    }

    /**
     *
     * @param int $cartId
     * @param object $extAttributes
     */
    public function afterSetDeliveryComment(
        $parent,
        $value
    ) {
        $quote = $this->checkoutSession->getQuote();

        $value = ($parent->getDeliveryComment()) ? $parent->getDeliveryComment() : "" ;
        $quote->setDeliveryComment($value);
    }
}
