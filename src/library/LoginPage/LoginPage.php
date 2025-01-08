<?php

namespace BcSitkaSpruce\Library\LoginPage;

use BcSitkaSpruce\Library\Enqueuer\Enqueuer;

/**
 * An API for customizing the login page.
 */
class LoginPage extends Enqueuer implements LoginPageInterface {

  protected string $headerText = '';

  protected string $headerUrl = '';

  public function __construct() {
    add_action('login_enqueue_scripts', [$this, 'setupEnqueueStyles'], 10, 0);
    add_action('login_enqueue_scripts', [$this, 'setupDeregisterStyles'], 10, 0);
    add_filter('login_headertext', [$this, 'setupLoginHeaderText'], 99, 1);
    add_filter('login_headerurl', [$this, 'setupLoginHeaderUrl'], 99, 1);
  }

  /**
   * @inheritDoc
   */
  public function setLoginHeaderText(string $text): void {
    $this->headerText = $text;
  }

  /**
   * @inheritDoc
   */
  public function setLoginHeaderUrl(string $url): void {
    $this->headerUrl = $url;
  }

  /**
   * Callback for the 'login_headertext' filter.
   */
  public function setupLoginHeaderText(string $current): string {
    return $this->headerText ?:
      (get_bloginfo('description') ?: get_bloginfo('name'));
  }

  /**
   * Callback for the 'login_headerurl' filter.
   */
  public function setupLoginHeaderUrl(string $current): string {
    return $this->headerUrl ?: get_home_url();
  }

}
