import firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/auth';
import { useEffect, useState } from 'react';
import { IUserConfig } from '../Api/backendServices';
import { fetchApi } from '../Api/fetchApi';

const firebaseConfig = {
	apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
	authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
	storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.REACT_APP_FIREBASE_APP_ID,
	measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

firebase.initializeApp(firebaseConfig);

export type TLoginData = {
	mail: string;
	password: string;
	remember?: boolean;
};

type TFbAuthResponse = [
	boolean,
	firebase.User | undefined,
	(info: TLoginData) => Promise<firebase.User>,
	() => Promise<boolean>,
	() => boolean,
	string | undefined
];

export const createUser = (name: string, email: string, password: string, phone: string): Promise<IUserConfig | void> => {
	return new Promise((resolve, reject) => {
		firebase
			.auth()
			.createUserWithEmailAndPassword(email, password)
			.then((userCredential) => {
				const user = userCredential.user;
				// user?.sendEmailVerification(); //! disabled for now. user also needs to be able to verify after action code expires.

				const newUE: IUserConfig = {
					email: email,
					uid: user?.uid,
					name: name,
					phone: phone,
				};

				fetchApi<IUserConfig>('/user/create', 'POST', JSON.stringify({ create: newUE }))
					.then((result) => {
						resolve(result);
					})
					.catch(() => {
						reject('Kunne ikke synkroniserer med serveren. Kontakt venligst support.');
					});

				resolve(
					userCredential.user?.updateProfile({
						displayName: name,
					})
				);
			})
			.catch((error) => {
				reject(`${error.code} ${error.message}`);
			});
	});
};

export const getIdToken = (): Promise<string> => {
	return new Promise((resolve, reject) => {
		firebase
			.auth()
			.currentUser?.getIdToken(/*set true here to trigger forceRefresh*/)
			.then((token: string) => {
				resolve(token);
			})
			.catch((err) => {
				reject(err);
			});
	});
};

export const fbAuth = (): TFbAuthResponse => {
	const [getAuthState, setAuthState] = useState<boolean>(false);
	const [getUserState, setUserState] = useState<firebase.User>();
	const [getUserTokenState, setUserTokenState] = useState<string>();

	useEffect(() => {
		const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				setAuthState(true);
				setUserState(user);
				user.getIdToken().then((token) => setUserTokenState(token));
			} else {
				setAuthState(false);
				setUserState(undefined);
			}
		});
		firebase.auth().onIdTokenChanged((user) => user?.getIdToken().then(setUserTokenState));

		return unsubscribe;
	}, []);

	const getLoginStatus = (): boolean => {
		const curUser = firebase.auth().currentUser;
		return curUser ? true : false;
	};

	const handleLogin = (info: TLoginData): Promise<firebase.User> => {
		return new Promise((resolve, reject) => {
			firebase.auth().setPersistence(info.remember ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.NONE);
			firebase
				.auth()
				.signInWithEmailAndPassword(info.mail, info.password)
				.then((user) => {
					if (user.user) {
						resolve(user.user);
					} else {
						reject();
					}
				})
				.catch((err) => {
					reject(err);
				});
		});
	};
	const handleLogout = (): Promise<boolean> => {
		return new Promise((resolve, reject) => {
			firebase
				.auth()
				.signOut()
				.then(() => {
					resolve(true);
				})
				.catch((err) => {
					reject(err);
				});
		});
	};

	return [getAuthState, getUserState, handleLogin, handleLogout, getLoginStatus, getUserTokenState];
};
