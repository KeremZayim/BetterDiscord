/**
 * @name FriendsDate
 * @author UnDead To Infinity
 * @authorId undeadtoinfinity
 * @version 1.0.1
 * @description Kullanıcı panellerinde ne zamandan beri arkadaş olduğunuzu gösterir (0BDFDB Kütüphanesi gereklidir).
 * @source https://github.com/KeremZayim/BetterDiscord/FriendsDate
 * @updateUrl https://raw.githubusercontent.com/KeremZayim/BetterDiscord/main/FriendsDate/FriendsDate.plugin.js
 */

module.exports = (_ => {
	const changeLog = {
		
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
		downloadLibrary () {
			BdApi.Net.fetch("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js").then(r => {
				if (!r || r.status != 200) throw new Error();
				else return r.text();
			}).then(b => {
				if (!b) throw new Error();
				else return require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.UI.showToast("Finished downloading BDFDB Library", {type: "success"}));
			}).catch(error => {
				BdApi.UI.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.UI.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(this.name)) window.BDFDB_Global.pluginQueue.push(this.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--text-strong); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${this.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var _this;
		var currentPopout, currentProfile;

		const FriendsDateComponent = class FriendsDate extends BdApi.React.Component {
			render() {
				const userId = this.props.user?.id || this.props.user;
				if (!userId) return null;

				const RelationshipStore = BDFDB.LibraryStores.RelationshipStore;
				if (!RelationshipStore || !RelationshipStore.isFriend(userId)) return null;

				const since = RelationshipStore.getSince(userId);
				if (!since) return null;

				const d = new Date(since);
				const dateStr = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;

				return BDFDB.ReactUtils.createElement("section", {
					className: BDFDB.disCN.userprofilesection,
					style: { marginBottom: "12px" },
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Heading, {
							className: BDFDB.disCN.userprofilesectionheading,
							variant: "text-xs/semibold",
							style: { color: "var(--text-strong)" },
							children: _this.labels.friendship_date
						}),
						BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.membersince,
							style: { display: "flex", alignItems: "center" },
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									style: { width: "16px", height: "16px", marginRight: "4px", color: "var(--text-muted)" },
									nativeClass: false,
									name: BDFDB.LibraryComponents.SvgIcon.Names.NUMPAD
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
									size: BDFDB.LibraryComponents.TextElement.Sizes.SIZE_14,
									children: dateStr
								})
							]
						})
					]
				});
			}
		};

		return class FriendsDate extends Plugin {
			onLoad () {
				_this = this;
				this.modulePatches = {
					before: [
						"UserThemeContainer"
					],
					after: [
						"UserHeaderUsername",
						"UserProfile"
					]
				};
			}
			
			onStart () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			processUserThemeContainer (e) {
				let popout = {props: e.instance.props.value || e.instance.props};
				if (popout.props.layout == "POPOUT" || popout.props.layout == "SIDEBAR") currentPopout = popout;
				if (popout.props.layout == "MODAL" || popout.props.layout == "MODAL_V2") currentProfile = popout;
			}

			processUserHeaderUsername (e) {
				let themeType = BDFDB.ObjectUtils.get(e.instance, "props.tags.props.themeType");
				if (!currentPopout || themeType != "SIDEBAR" && themeType != "POPOUT" || e.instance.props.className) return;
				let user = e.instance.props.user || BDFDB.LibraryStores.UserStore.getUser(e.instance.props.userId);
				if (!user || user.isNonUserBot()) return;
				
				e.returnvalue = [e.returnvalue].flat(10);
				e.returnvalue.push(BDFDB.ReactUtils.createElement(FriendsDateComponent, {
					user: user
				}));
			}

			processUserProfile (e) {
				if (!currentProfile || e.instance.props.themeType != "MODAL_V2") return;
				let user = currentProfile.props.user || BDFDB.LibraryStores.UserStore.getUser(currentProfile.props.userId);
				if (!user || user.isNonUserBot()) return;
				
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["heading", BDFDB.LanguageUtils.LanguageStrings.MEMBER_SINCE]]});
				if (index > -1) {
					children.splice(index, 0, BDFDB.ReactUtils.createElement(FriendsDateComponent, {
						user: user
					}));
				} else {
					e.returnvalue = [e.returnvalue].flat(10);
					e.returnvalue.push(BDFDB.ReactUtils.createElement(FriendsDateComponent, {
						user: user
					}));
				}
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							friendship_date:					"Дата на приятелство"
						};
					case "cs":		// Czech
						return {
							friendship_date:					"Datum přátelství"
						};
					case "da":		// Danish
						return {
							friendship_date:					"Venskabsdato"
						};
					case "de":		// German
						return {
							friendship_date:					"Freundschaftsdatum"
						};
					case "el":		// Greek
						return {
							friendship_date:					"Ημερομηνία φιλίας"
						};
					case "es":		// Spanish
						return {
							friendship_date:					"Fecha de amistad"
						};
					case "fi":		// Finnish
						return {
							friendship_date:					"Ystävyyspäivä"
						};
					case "fr":		// French
						return {
							friendship_date:					"Date d'amitié"
						};
					case "hi":		// Hindi
						return {
							friendship_date:					"मित्रता की तिथि"
						};
					case "hr":		// Croatian
						return {
							friendship_date:					"Datum prijateljstva"
						};
					case "hu":		// Hungarian
						return {
							friendship_date:					"Barátság dátuma"
						};
					case "it":		// Italian
						return {
							friendship_date:					"Data di amicizia"
						};
					case "ja":		// Japanese
						return {
							friendship_date:					"友情の日付"
						};
					case "ko":		// Korean
						return {
							friendship_date:					"우정 날짜"
						};
					case "lt":		// Lithuanian
						return {
							friendship_date:					"Draugystės data"
						};
					case "nl":		// Dutch
						return {
							friendship_date:					"Vriendschapsdatum"
						};
					case "no":		// Norwegian
						return {
							friendship_date:					"Vennskapsdato"
						};
					case "pl":		// Polish
						return {
							friendship_date:					"Data przyjaźni"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							friendship_date:					"Data de amizade"
						};
					case "ro":		// Romanian
						return {
							friendship_date:					"Data prieteniei"
						};
					case "ru":		// Russian
						return {
							friendship_date:					"Дата дружбы"
						};
					case "sv":		// Swedish
						return {
							friendship_date:					"Vänskapsdatum"
						};
					case "th":		// Thai
						return {
							friendship_date:					"วันที่เป็นเพื่อนกัน"
						};
					case "tr":		// Turkish
						return {
							friendship_date:					"Arkadaşlık Tarihi"
						};
					case "uk":		// Ukrainian
						return {
							friendship_date:					"Дата дружби"
						};
					case "vi":		// Vietnamese
						return {
							friendship_date:					"Ngày kết bạn"
						};
					case "zh-CN":	// Chinese (China)
						return {
							friendship_date:					"友谊日期"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							friendship_date:					"友誼日期"
						};
					default:		// English
						return {
							friendship_date:					"Friendship Date"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
