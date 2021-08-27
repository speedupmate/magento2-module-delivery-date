<?php
namespace SR\DeliveryDate\Observer;

use Magento\Framework\Event\Observer as EventObserver;
use Magento\Framework\Event\ObserverInterface;
use Magento\Quote\Model\QuoteRepository;
use SR\DeliveryDate\Model\Validator;
use SR\DeliveryDate\Model\Config;

class SalesModelServiceQuoteSubmitBefore implements ObserverInterface
{
    /**
     * @var QuoteRepository
     */
    private $quoteRepository;

    /**
     * @var Validator
     */
    private $validator;

    /**
     * SalesModelServiceQuoteSubmitBefore constructor.
     *
     * @param QuoteRepository $quoteRepository
     * @param Validator $validator
     */
    public function __construct(
        QuoteRepository $quoteRepository,
        Validator $validator,
        Config $config
    ) {
        $this->quoteRepository = $quoteRepository;
        $this->validator = $validator;
        $this->config = $config;
    }

    /**
     * @param EventObserver $observer
     * @return $this
     * @throws \Exception
     */
    public function execute(EventObserver $observer)
    {
        $order = $observer->getOrder();
        /** @var \Magento\Quote\Model\Quote $quote */
        $quote = $this->quoteRepository->get($order->getQuoteId());
        $date = $quote->getDeliveryDate();

        if ($this->config->getRequiredDeliveryDate() && $this->validator->validate($date)) {
            $order->setDeliveryDate($date);
        }

        $order->setDeliveryComment($quote->getDeliveryComment());

        return $this;
    }
}
