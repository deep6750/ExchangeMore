import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import {useForm, Controller} from 'react-hook-form';
import * as Animatable from 'react-native-animatable';

import {useAuth} from '../context/AuthContext';
import {colors} from '../constants/colors';

const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {signIn, signUp} = useAuth();

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
    watch,
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(data.email, data.password);
      } else {
        result = await signUp(data.email, data.password, {
          full_name: data.fullName,
        });
      }

      if (!result.success) {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
  };

  const renderInput = (name, placeholder, icon, options = {}) => (
    <Controller
      name={name}
      control={control}
      rules={options.rules}
      render={({field: {onChange, onBlur, value}}) => (
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Icon
              name={icon}
              size={20}
              color={colors.text.tertiary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor={colors.text.tertiary}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry={options.secure && !showPassword}
              autoCapitalize={options.autoCapitalize || 'none'}
              keyboardType={options.keyboardType || 'default'}
              returnKeyType={options.returnKeyType || 'next'}
            />
            {options.secure && (
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}>
                <Icon
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.text.tertiary}
                />
              </TouchableOpacity>
            )}
          </View>
          {errors[name] && (
            <Text style={styles.errorText}>{errors[name].message}</Text>
          )}
        </View>
      )}
    />
  );

  return (
    <LinearGradient colors={colors.gradient.dark} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          {/* Header */}
          <Animatable.View animation="fadeInDown" style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={colors.gradient.primary}
                style={styles.logoBackground}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}>
                <Text style={styles.logoText}>G</Text>
              </LinearGradient>
            </View>
            <Text style={styles.appName}>Grover</Text>
            <Text style={styles.tagline}>Smart Forex Trading</Text>
          </Animatable.View>

          {/* Form */}
          <Animatable.View animation="fadeInUp" delay={300} style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </Text>
              <Text style={styles.formSubtitle}>
                {isLogin 
                  ? 'Sign in to continue trading' 
                  : 'Join thousands of successful traders'
                }
              </Text>
            </View>

            <View style={styles.form}>
              {!isLogin && (
                renderInput(
                  'fullName',
                  'Full Name',
                  'user',
                  {
                    rules: {
                      required: 'Full name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    },
                    autoCapitalize: 'words'
                  }
                )
              )}

              {renderInput(
                'email',
                'Email Address',
                'mail',
                {
                  rules: {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  },
                  keyboardType: 'email-address'
                }
              )}

              {renderInput(
                'password',
                'Password',
                'lock',
                {
                  rules: {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  },
                  secure: true
                }
              )}

              {!isLogin && (
                renderInput(
                  'confirmPassword',
                  'Confirm Password',
                  'lock',
                  {
                    rules: {
                      required: 'Please confirm your password',
                      validate: value =>
                        value === password || 'Passwords do not match'
                    },
                    secure: true
                  }
                )
              )}

              {isLogin && (
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}>
                <LinearGradient
                  colors={colors.gradient.primary}
                  style={styles.submitButtonGradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}>
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.submitButtonText}>
                        {isLogin ? 'Signing In...' : 'Creating Account...'}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Toggle Login/Signup */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
              </Text>
              <TouchableOpacity onPress={toggleMode}>
                <Text style={styles.toggleLink}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Social Login */}
            <View style={styles.socialContainer}>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <Icon name="smartphone" size={24} color={colors.text.primary} />
                  <Text style={styles.socialButtonText}>Phone</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.socialButton}>
                  <Icon name="mail" size={24} color={colors.text.primary} />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: colors.accent.primary,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  formContainer: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: 24,
    padding: 24,
  },
  formHeader: {
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.primary,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  passwordToggle: {
    padding: 4,
  },
  errorText: {
    color: colors.accent.danger,
    fontSize: 14,
    marginTop: 8,
    marginLeft: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: colors.accent.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    height: 56,
    borderRadius: 16,
  },
  submitButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  toggleText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  toggleLink: {
    color: colors.accent.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  socialContainer: {
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.primary,
  },
  dividerText: {
    color: colors.text.tertiary,
    fontSize: 14,
    paddingHorizontal: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 16,
    paddingVertical: 16,
    marginHorizontal: 4,
  },
  socialButtonText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default LoginScreen;
