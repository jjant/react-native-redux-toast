import React, { Component } from 'react';
import { View, Animated, Text } from 'react-native';

import styles from './Toast.styles';

import { actionCreators as toastActions } from './redux/actions';

export default class Toast extends Component {
  state = {
    fadeAnimation: new Animated.Value(0),
    shadowOpacity: new Animated.Value(0),
    present: false,
    message: '',
    dismissTimeout: null
  };

  componentWillReceiveProps({ message, error, duration, warning }) {
    if (message) {
      const dismissTimeout = setTimeout(() => {
        this.props.dispatch(toastActions.hide());
      }, duration);
      clearTimeout(this.state.dismissTimeout);
      this.show(message, { error, warning, dismissTimeout });
    } else {
      this.hide();
    }
  }

  show(message, { error, warning, dismissTimeout }) {
    this.setState(
      {
        present: true,
        fadeAnimation: new Animated.Value(0),
        shadowOpacity: new Animated.Value(0),
        message,
        error,
        warning,
        dismissTimeout
      },
      () => {
        Animated.timing(this.state.fadeAnimation, { toValue: 1 }).start();
        Animated.timing(this.state.shadowOpacity, { toValue: 0.5 }).start();
      }
    );
  }

  hide() {
    Animated.timing(this.state.shadowOpacity, { toValue: 0 }).start();
    Animated.timing(this.state.fadeAnimation, { toValue: 0 }).start(() => {
      this.setState({ present: false, message: null, error: false, warning: false, dismissTimeout: null });
    });
  }

  render() {
    if (!this.state.present) {
      return null;
    }

    const messageStyles = [styles.messageContainer, this.props.containerStyle];
    if (this.state.error) {
      messageStyles.push(styles.error, this.props.errorStyle);
    } else if (this.state.warning) {
      messageStyles.push(styles.warning, this.props.warningStyle);
    }
    return (
      <Animated.View
        style={[
          styles.shadow,
          styles.container,
          { opacity: this.state.fadeAnimation, shadowOpacity: this.state.shadowOpacity }
        ]}
      >
        <View style={messageStyles}>
          {this.props.getMessageComponent(this.state.message, {
            error: this.state.error,
            warning: this.state.warning
          })}
        </View>
      </Animated.View>
    );
  }
}

Toast.defaultProps = {
  getMessageComponent(message) {
    return (
      <Text style={this.messageStyle}>
        {message}
      </Text>
    );
  }
};

Toast.propTypes = {
  containerStyle: View.propTypes.style,
  message: React.PropTypes.string,
  messageStyle: Text.propTypes.style, // eslint-disable-line react/no-unused-prop-types
  error: React.PropTypes.bool,
  errorStyle: View.propTypes.style,
  warning: React.PropTypes.bool,
  warningStyle: View.propTypes.style,
  duration: React.PropTypes.number,
  getMessageComponent: React.PropTypes.func
};
