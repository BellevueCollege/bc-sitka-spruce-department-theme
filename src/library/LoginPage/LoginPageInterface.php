<?php

namespace BcSitkaSpruce\Library\LoginPage;

use BcSitkaSpruce\Library\Enqueuer\EnqueuerInterface;

/**
 * Definition for an API for customizing the login page.
 */
interface LoginPageInterface extends EnqueuerInterface {

  /**
   * Set the login header text.
   */
  public function setLoginHeaderText(string $text): void;

  /**
   * Set the login header url.
   */
  public function setLoginHeaderUrl(string $url): void;

}
