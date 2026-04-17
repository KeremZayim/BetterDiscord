/**
 * @name FriendsDate
 * @author UnDead To Infinity
 * @authorId undeadtoinfinity
 * @version 1.1.0
 * @description Kullanıcı panellerinde ne zamandan beri arkadaş olduğunuzu ve toplam arkadaşlık süresini tek bir başlık altında gösterir.
 * @source https://github.com/KeremZayim/BetterDiscord/tree/main/FriendsDate
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

				const startDate = new Date(since);
				const endDate = new Date();
				
				const dateStr = `${startDate.getDate().toString().padStart(2, '0')}.${(startDate.getMonth() + 1).toString().padStart(2, '0')}.${startDate.getFullYear()} ${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}:${startDate.getSeconds().toString().padStart(2, '0')}`;

				let years = endDate.getFullYear() - startDate.getFullYear();
				let months = endDate.getMonth() - startDate.getMonth();
				let days = endDate.getDate() - startDate.getDate();
				
				if (days < 0) {
					months--;
					days += new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
				}
				if (months < 0) {
					years--;
					months += 12;
				}

				const durationParts = [];
				if (years > 0) durationParts.push(`${years} ${_this.labels[years == 1 ? "year" : "years"]}`);
				if (months > 0) durationParts.push(`${months} ${_this.labels[months == 1 ? "month" : "months"]}`);
				if (days > 0) durationParts.push(`${days} ${_this.labels[days == 1 ? "day" : "days"]}`);
				
				const durationStr = durationParts.join(" ");

				const sectionChildren = [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Heading, {
						className: BDFDB.disCN.userprofilesectionheading,
						variant: "text-xs/semibold",
						style: { color: "var(--text-strong)" },
						children: _this.labels.friendship_info
					}),
					BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.membersince,
						style: { display: "flex", alignItems: "center", marginBottom: "4px" },
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
				];

				if (durationStr) {
					sectionChildren.push(
						BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.membersince,
							style: { display: "flex", alignItems: "center" },
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									style: { width: "16px", height: "16px", marginRight: "4px", color: "var(--text-muted)" },
									nativeClass: false,
									name: BDFDB.LibraryComponents.SvgIcon.Names.CLOCK
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
									size: BDFDB.LibraryComponents.TextElement.Sizes.SIZE_14,
									children: durationStr
								})
							]
						})
					);
				}

				return BDFDB.ReactUtils.createElement("section", {
					className: BDFDB.disCN.userprofilesection,
					style: { marginBottom: "12px" },
					children: sectionChildren
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
					case "tr": return {
						friendship_info: "Arkadaşlık Tarihi & Süresi",
						year: "yıl", years: "yıl", month: "ay", months: "ay", day: "gün", days: "gün" 
					};
					case "bg": return {
						friendship_info: "Дата и продължителност на приятелството",
						year: "година", years: "години", month: "месец", months: "месеца", day: "ден", days: "дни" 
					};
					case "cs": return {
						friendship_info: "Datum ve trvání přátelství",
						year: "rok", years: "let", month: "měsíc", months: "měsíců", day: "den", days: "dní" 
					};
					case "da": return {
						friendship_info: "Venskabsdato og varighed",
						year: "år", years: "år", month: "måned", months: "måneder", day: "dag", days: "dage" 
					};
					case "de": return {
						friendship_info: "Freundschaftsdatum & -dauer",
						year: "Jahr", years: "Jahre", month: "Monat", months: "Monate", day: "Tag", days: "Tage" 
					};
					case "el": return {
						friendship_info: "Ημερομηνία & Διάρκεια Φιλίας",
						year: "έτος", years: "έτη", month: "μήνας", months: "μήνες", day: "ημέρα", days: "ημέρες" 
					};
					case "es": return {
						friendship_info: "Fecha y duración de la amistad",
						year: "año", years: "años", month: "mes", months: "meses", day: "día", days: "días" 
					};
					case "fi": return {
						friendship_info: "Ystävyyden päivämäärä ja kesto",
						year: "vuosi", years: "vuotta", month: "kuukausi", months: "kuukautta", day: "päivä", days: "päivää" 
					};
					case "fr": return {
						friendship_info: "Date & durée de l'amitié",
						year: "an", years: "ans", month: "mois", months: "mois", day: "jour", days: "jours" 
					};
					case "hi": return {
						friendship_info: "मित्रता की तिथि और अवधि",
						year: "वर्ष", years: "वर्ष", month: "महीना", months: "महीने", day: "दिन", days: "दिन" 
					};
					case "hr": return {
						friendship_info: "Datum i trajanje prijateljstva",
						year: "godina", years: "godina", month: "mjesec", months: "mjeseci", day: "dan", days: "dana" 
					};
					case "hu": return {
						friendship_info: "Barátság dátuma és időtartama",
						year: "év", years: "év", month: "hónap", months: "hónap", day: "nap", days: "nap" 
					};
					case "it": return {
						friendship_info: "Data e durata dell'amicizia",
						year: "anno", years: "anni", month: "mese", months: "mesi", day: "giorno", days: "giorni" 
					};
					case "ja": return {
						friendship_info: "友情の日付と期間",
						year: "年", years: "年", month: "ヶ月", months: "ヶ月", day: "日", days: "日" 
					};
					case "ko": return {
						friendship_info: "우정 날짜 및 기간",
						year: "년", years: "년", month: "개월", months: "개월", day: "일", days: "일" 
					};
					case "lt": return {
						friendship_info: "Draugystės data ir trukmė",
						year: "metai", years: "metai", month: "mėnuo", months: "mėnesiai", day: "diena", days: "dienos" 
					};
					case "nl": return {
						friendship_info: "Vriendschapsdatum & duur",
						year: "jaar", years: "jaar", month: "maand", months: "maanden", day: "dag", days: "dagen" 
					};
					case "no": return {
						friendship_info: "Vennskapsdato og varighet",
						year: "år", years: "år", month: "måned", months: "måneder", day: "dag", days: "dager" 
					};
					case "pl": return {
						friendship_info: "Data i czas trwania przyjaźni",
						year: "rok", years: "lat", month: "miesiąc", months: "miesięcy", day: "dzień", days: "dni" 
					};
					case "pt-BR": return {
						friendship_info: "Data e duração da amizade",
						year: "ano", years: "anos", month: "mês", months: "meses", day: "dia", days: "dias" 
					};
					case "ro": return {
						friendship_info: "Data și durata prieteniei",
						year: "an", years: "ani", month: "lună", months: "luni", day: "zi", days: "zile" 
					};
					case "ru": return {
						friendship_info: "Дата и продолжительность дружбы",
						year: "год", years: "лет", month: "месяц", months: "месяцев", day: "день", days: "дней" 
					};
					case "sv": return {
						friendship_info: "Vänskapsdatum och varaktighet",
						year: "år", years: "år", month: "månad", months: "månader", day: "dag", days: "dagar" 
					};
					case "th": return {
						friendship_info: "วันที่และระยะเวลาความเป็นเพื่อน",
						year: "ปี", years: "ปี", month: "เดือน", months: "เดือน", day: "วัน", days: "วัน" 
					};
					case "uk": return {
						friendship_info: "Дата та тривалість дружби",
						year: "рік", years: "років", month: "місяць", months: "місяців", day: "день", days: "днів" 
					};
					case "vi": return {
						friendship_info: "Ngày vè thời gian kết bạn",
						year: "năm", years: "năm", month: "tháng", months: "tháng", day: "ngày", days: "ngày" 
					};
					case "zh-CN": return {
						friendship_info: "友谊日期和时长",
						year: "年", years: "年", month: "个月", months: "个月", day: "天", days: "天" 
					};
					case "zh-TW": return {
						friendship_info: "友誼日期和時長",
						year: "年", years: "年", month: "個月", months: "個月", day: "天", days: "天" 
					};
					default: return {
						friendship_info: "Friendship Date & Duration",
						year: "year", years: "years", month: "month", months: "months", day: "day", days: "days" 
					};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
