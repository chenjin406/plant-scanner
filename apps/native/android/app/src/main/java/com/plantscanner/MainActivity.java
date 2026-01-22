package com.plantscanner;

import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

public class MainActivity extends ReactActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(null);
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
      this,
      getMainComponentName(),
      DefaultReactActivityDelegate.LoadPolicy.UNDEFINED,
      DefaultReactActivityDelegate.ViewManagerPolicy.AUTODETECT
    );
  }
}
